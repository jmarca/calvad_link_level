var reducer = require('./reducer')
var couch_cacher = require('./couchCacher')

var _ = require('lodash')
var csv = require('csv')
var build_csv=require('./build_csv').build_csv



var columns = {'n'            :'Total Vehicle Miles Traveled'
              ,'hh'           :'Heavy Heavy-Duty Truck Vehicle Miles Traveled'
              ,'not_hh':'Trucks excluding Heavy Heavy-Duty Vehicle Miles Traveled'
              ,'o' :'Occupancy (all vehicles) from 0 (empty) to 1 (stopped)'
              ,'avg_hh_weight':'avg HHD weight, kips per truck'
              ,'avg_hh_axles' :'avg HHD axles, axle count per truck'
              ,'avg_hh_spd'   :'avg HHD spd, miles per hour'
              ,'avg_nh_weight':'avg not-HHD weight, kips per truck'
              ,'avg_nh_axles' :'avg not-HHD axles, axle count per truck'
              ,'avg_nh_spd'   :'avg not-HHD spd, miles per hour'
              ,'avg_veh_spd'  :'avg all-vehicles spd, miles per hour'
              ,'miles'        :'length of section'
              ,'lane_miles':'lane miles for section'
              ,'detector_count':'number of detectors used in solution'
              ,'detectors':     'list of detectors used in solution'
              ,'i':             'record index'
              ,'document':      'source document name'
              ,'ts':            'time stamp'
              ,'freeway':       'freeway'
              }
var dh = ["ts","freeway","n","hh","not_hh","o","avg_veh_spd","avg_hh_weight","avg_hh_axles","avg_hh_spd","avg_nh_weight","avg_nh_axles","avg_nh_spd","miles","lane_miles","detector_count","detectors"]

function get_id(req,res,next){
    // req.feature needs to have properties.  Properties needs to have
    // direction, detector_id, ts, endts

    // also request needs to have spatial and temporal aggregation level
    var feature = req.params.feature
    if (feature === undefined ) throw new Error ('no feature in request')

    var time_agg = req.params.aggregate
    var spatial_agg = req.params.spatialagg

    var accum = reducer()

    var cacher = couch_cacher.couchCache({'time_agg':time_agg
                              ,'spatial_agg':spatial_agg})
    var getter = cacher.get(accum.process_collated_record)

    // now get the feature
    //console.log(feature)
    getter(feature,function(err){

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
        console.log('format is '+format)
        if(format.toLowerCase()==='json'){
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(featurehash))
        }
        if(format.toLowerCase()==='csv'){
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
            builder(err,featurehash)
            res.end()
        }
        return null

    })

}

exports.get_id=get_id