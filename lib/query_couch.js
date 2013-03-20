var reducer = require('./reducer')
var couch_cacher = require('./couchCacher')

var _ = require('lodash');



function get_id(req,res,next){
    // req.feature needs to have properties.  Properties needs to have
    // direction, detector_id, ts, endts

    // also request needs to have spatial and temporal aggregation level
    var feature = req.params.feature
    if (feature === undefined ) throw new Error ('no feature in request')

    var time_agg = req.params.aggregate
    var spatial_agg = req.params.spatialagg

    var accum = reducer();

    var cacher = couch_cacher.couchCache({'time_agg':time_agg
                              ,'spatial_agg':spatial_agg})
    var getter = cacher.get(accum.process_collated_record)

    // now get the feature
    //console.log(feature)
    getter(feature,function(err){

        // here, area_stash contains what I want, return to caller
        if(err) {
            return next(err);
        }
        // add features to output and say goodbye
        var featurehash = {
            'properties' : {'document': req.query // what?
                           }}

        featurehash = accum.stash_out(featurehash,spatial_agg)
        accum.reset()
        //default is json  other formats handled upstream
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(featurehash))
        return null

    })

}

exports.get_id=get_id