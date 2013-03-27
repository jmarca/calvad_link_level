var geoQuery = require('detector_postgis_query').geoQuery
//var shape_service = require('shapes_postgis').shape_geojson_generation
var json_or_csv_handler = require('../lib/json_or_csv_handler').json_or_csv_handler
var logger = require('../lib/logging').logger
var _ = require('lodash')

var env = process.env
var puser = env.PSQL_USER
var ppass = env.PSQL_PASS
var phost = env.PSQL_HOST
var pport = env.PSQL_PORT || 5432
var pdb = env.PSQL_DB
var pg = require('pg')

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

                // var doGeo = geoQuery(req,function(err,features){
                //                 if(err) return next(err)
                //                 req.params.features=features
                //                 return next(null)
                //             })
                // var connectionString = "pg://"+user+":"+pass+"@"+host+":"+port+"/"+db
                // console.log(connectionString)
                // pg.connect(connectionString, doGeo)
                // return null
    var osmConnectionString = "pg://"+puser+":"+ppass+"@"+phost+":"+pport+"/osm";
    function geohandler(req,res,next){
        // extract area using geoQuery library

        var doGeo = geoQuery(req,function(err,features){
                        if(err){
                            return next(err)
                        }
                        // need to collate features according to detector_id
                        features = _.map(features
                                        ,function(f){
                                             return {'properties':f}
                                         });
                        features = _.groupBy(features,'detector_id')
                        logger.debug(features)

                        req.params.collector = _.values(features)
                        logger.debug('passing along '+req.params.collector.length+' features')
                        return next()
                    })
        pg.connect(osmConnectionString, doGeo);
        return null
    }

    app.get('/'+prefix+'/:areatype/link_level/:aggregate/:year/:area.:format'
           ,function(req,res,next){
                if(['json','csv'].indexOf(req.params.format.toLowerCase()) === -1){
                    console.log('bad route')
                    return next('route')
                }
                return next()
            }
           ,geohandler
           ,json_or_csv_handler
           )

}
exports.area_query_service=area_query_service
