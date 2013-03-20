var reducer = require('./reducer')
var couch_cacher = require('./couchCacher')

var _ = require('lodash');


function query_couch(opts){

    function get_id(req,res,next){
        // req.feature needs to have properties.  Properties needs to have
        // direction, detector_id, ts, endts

        // also request needs to have spatial and temporal aggregation level
        var feature = req.feature
        if (feature === undefined ) throw new Error ('no feature in request')

        var time_agg = req.timeagg
        var spatial_agg = req.spatialagg

        var area_stash = reducer()

        var cacher = couch_cacher({'time_agg':time_agg
                                  ,'spatial_agg':spatial_agg})
        var getter = couch_cacher.get(area_stash)

        // now get the feature
        getter(feature,function(err){

            // here, area_stash contains what I want, return to caller
            if(err) {
                return next(err);
            }
            // add features to output and say goodbye
            var featurehash = {
                'properties' : {'document': req.query // wtf?
                               }}

            var data_stash = reducer.stash_out(featurehash)
            reducer.reset()
            //default is json  other formats handled upstream
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(featurehash))
            return null

        })

    }
}
