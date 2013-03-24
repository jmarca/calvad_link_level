var calvad_querier = require('../lib/query_couch')
var get_time = require('../lib/get_time').get_time
var geoQuery = require('detector_postgis_query').geoQuery
var pg = require('pg')
var _ = require('lodash')
var async = require('async')

var env = process.env
var puser = env.PSQL_USER
var ppass = env.PSQL_PASS
var phost = env.PSQL_HOST
var pport = env.PSQL_PORT || 5432
var pdb = env.PSQL_DB

var csv = require('csv')
var build_csv=require('../lib/build_csv')
var columns = build_csv.columns
var dh=build_csv.dh
build_csv = build_csv.build_csv

/**
 * area_query_service
 *
 */

function area_query_service(app,opts){
    var prefix = opts.prefix
    if (prefix === undefined) prefix = 'data'
    // need to handle leading and trailing slashes properly
    var host=opts.host || phost
    var port = opts.port || pport
    var user = opts.user || puser
    var pass = opts.pass || ppass
    var db = opts.db || pdb
    if(user === undefined || pass === undefined || db===undefined){
        throw new Error('need user, pass, db defined in options object or environment variables')
    }


    // extract area
    //
    // if json, return detectors list
    //
    // if csv
    // process detectors
    // merge pipe csv


    app.get('/'+prefix+'/:area/link_level/:aggregate/:year/:areaid.:format'
           ,function(req,res,next){
                if(['json','csv'].indexOf(req.params.format.toLowerCase()) === -1){
                    console.log('bad route')
                    return next('route')
                }


// Okay, I need to refactor query_couch to extract the csv and json stuff
// I should move those external, because if I have csv, I need to multiplex
// all of the detectors to the csv, whereas the current handler just
// dumps straight off to the response object.
//
// Alternately, I can overwrite the response object with something new
// and pipe a stream of csv back to the client that way.  Probably
// that would be fine, as long as I don't try to close the stream when
// a detector is done.
//
                // extract area
                var doGeo = geoQuery(req,function(err,features){
                                if(err) return next(err)
                                req.params.features=features
                                return next(null)
                            })
                var connectionString = "pg://"+user+":"+pass+"@"+host+":"+port+"/"+db
                console.log(connectionString)
                pg.connect(connectionString, doGeo)
                return null
            }
           ,function(req,res,next){
                // now,handle features list.
                //
                // either have json, and just return it, or have csv,
                // and need to multiplex it

                if(req.params.format.toLowerCase() === 'json'){
                    res.json(req.params.features)
                    return res.end()
                }

                // if still here, have a csv case
                // set up the csv dumpster

                res.writeHead(200, { 'Content-Type': 'text/csv' })
                var csv_writer = csv()
                csv_writer.pipe(res)
                var builder = build_csv({'columns':columns
                                        ,'default_header' :dh
                                        ,'writestream':csv_writer
                                        }
                                       ,function(err,rows){
                                                //console.log(rows)
                                                if(err){
                                                    console.log(err)
                                                    return err
                                                }
                                                return null
                                            })
                    req.params['csv_builder'] = builder

                var start_end = get_time(req)
                req.params['spatialagg']='freeway'

                // set up a queue processor
                var detector_handler = function(feature,done){
                    var localreq = req
                    localreq.params['feature']=feature
                    calvad_querier.get_id(localreq,null,done)
                }
                var feature_queue=async.queue(detector_handler,5)
                _.each(req.params.features
                      ,function(feature){
                           // force the time to the full year
                           feature.properties.ts = start_end.start.getTime()/1000
                           feature.properties.endts = start_end.end.getTime()/1000
                           feature_queue.push(feature)
                       })
                feature_queue.drain=function(){
                    next()
                    return null
                }
                return null
            }
           ,calvad_querier.get_id
           )

}
exports.area_query_service=area_query_service
