var calvad_querier = require('../lib/query_couch')
var get_time = require('../lib/get_time').get_time
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
                return next()
            }
           ,calvad_querier.get_id
           )

}
exports.query_service=query_service
