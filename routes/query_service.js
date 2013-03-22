var calvad_querier = require('../lib/query_couch')
var get_time = require('../lib/get_time').get_time
var csv = require('csv')

var build_csv=require('./build_csv')
var columns = build_csv.columns
var dh=build_csv.dh
build_csv = build_csv.build_csv

function query_service(app,prefix){
    if (prefix === undefined) prefix = ''
    // need to handle trailing slash properly
    app.get('/'+prefix+'/:spatialagg/:aggregate/:year/:detector_id.:format'
           ,function(req,res,next){
                if(['json','csv'].indexOf(req.params.format.toLowerCase()) === -1)
                    return next()
                if(['freeway','detector'].indexOf(req.params.spatialagg.toLowerCase()) === -1)
                    return next('route')
                // build the feature to extract
                var start_end = get_time(req)
                var feature = {'properties':{}}
                feature.properties.ts = start_end.start.getTime()/1000
                feature.properties.endts = start_end.end.getTime()/1000
                feature.properties.detector_id = req.params.detector_id
                req.params['feature'] = feature
                // don't like doing this before the content is prepared...
                if(req.params.format.toLowerCase() === 'csv'){
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
                }
                return next()
            }
           ,calvad_querier.get_id
           ,function(req,res,next){
                if(req.params.format.toLowerCase() === 'csv'){
                    return res.end()
                }
                if(req.params.format.toLowerCase() === 'json'){
                    res.writeHead(200, { 'Content-Type': 'application/json' })
                    res.json(req.params.feature)
                    return res.end()
                }
                return next()
            }
           )

}
exports.query_service=query_service
