var calvad_querier = require('../lib/query_couch')
var get_time = require('../lib/get_time').get_time
//var geoQuery = require('detector_postgis_query').geoQuery
var shape_service = require('shapes_postgis').shape_geojson_generation
var json_or_csv_handler = require('../lib/json_or_csv_handler').json_or_csv_handler
var logger = require('../lib/logging').logger
var _ = require('lodash')

var env = process.env
var puser = env.PSQL_USER
var ppass = env.PSQL_PASS
var phost = env.PSQL_HOST
var pport = env.PSQL_PORT || 5432
var pdb = env.PSQL_DB

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

    // extract area using shapes_postgis library
    var vds_options={'db':'osm'
                    ,'table':'tempseg.tdetector'
                    ,'alias':'t'
                    ,'host':host
                    ,'username':user
                    ,'password':pass
                    ,'port':port
                    ,'select_properties':{'t.refnum'     : 'freeway'
                                         ,'t.direction'  : 'direction'
                                         ,'t.detector_id': 'detector_id'
                                         }
                    ,'id_col':['detector_id','direction']
                    ,'area_type_param':'areatype'
                    ,'area_param':'area'
                    ,'where_clause':'1=1 order by detector_id,direction'
                    }
    var vdsservice = shape_service(vds_options)

    app.get('/'+prefix+'/:areatype/link_level/:aggregate/:year/:area.:format'
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

                var collector=[]

                var callback = function(){
                    req.params.collector = collector
                    next()
                }
                req.params['row_handler']= function(row){
                    var val = {}
                    _.each(vds_options.select_properties
                          ,function(v,k){
                               val[v] = row[v]
                           });
                    if(vds_options.id_col !== undefined){
                        var id = _.map(vds_options.id_col
                                      ,function(k){
                                           return row[k]
                                       })
                        if(_.isArray(id))
                            id = id.join('_')
                        val.id = id
                    }
                    collector.push(val)
                }

                return vdsservice(req,res,next,callback)
            }
           ,json_or_csv_handler
           )

}
exports.area_query_service=area_query_service
