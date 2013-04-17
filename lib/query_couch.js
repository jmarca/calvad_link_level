var reducer = require('calvad_reducer')
var couch_cacher = require('calvad_couch_cacher')

var _ = require('lodash')
var async = require('async')

function get_id(req,res,next){
    // req.feature needs to have properties.  Properties needs to have
    // direction, detector_id, ts, endts

    // also request needs to have spatial and temporal aggregation level
    var feature = req.params.feature
    if (feature === undefined ) throw new Error ('no feature in request')
    if(! _.isArray(feature)){
        feature = [feature]
    }
    var time_agg = req.params.aggregate
    var spatial_agg = req.params.spatialagg

    var accum = reducer()

    var cacher = couch_cacher.couchCache({'time_agg':time_agg
                              ,'spatial_agg':spatial_agg})
    var getter = cacher.get(accum.process_collated_record)

    // now get the feature(s)
    async.each(feature
              ,getter
              ,function(err){
                   // here, area_stash contains what I want, return to caller
                   if(err) {
                       return next(err)
                   }
                   // add features to output and say goodbye
                   var featurehash = {
                       'properties' : {'document': req.query // what?
                                      }}

                   featurehash = accum.stash_out(featurehash,spatial_agg)
                   accum.reset()
                   //default is json
                   var format = req.params.format
                   if(format.toLowerCase()==='json'){
                       req.params.feature = featurehash
                       return next()
                   }
                   if(format.toLowerCase()==='csv'){
                       var builder = req.params.csv_builder
                       builder(err,featurehash)
                       return next()
                   }
                   return next('fell off the end!')
               });
        return null
}

exports.get_id=get_id