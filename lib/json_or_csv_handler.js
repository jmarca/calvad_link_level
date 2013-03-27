var _ = require('lodash')
var async = require('async')
var calvad_querier = require('./query_couch')
var get_time = require('./get_time').get_time

var csv = require('csv')
var build_csv=require('./build_csv')
var columns = build_csv.columns
var dh=build_csv.dh
build_csv = build_csv.build_csv

exports.json_or_csv_handler = function json_or_csv_handler(req,res,next){
    // now,handle features list.
    //
    // either have json, and just return it, or have csv,
    // and need to multiplex it

    if(req.params.format.toLowerCase() === 'json'){
        res.json(req.params.collector)
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
    req.params['spatialagg']='detector'

    // set up a queue processor
    var detector_handler = function(feature,done){
        var localreq = req
        localreq.params['feature']=feature
        calvad_querier.get_id(localreq,null,done)
    }
    var feature_queue=async.queue(detector_handler,5)
    _.each(req.params.collector
          ,function(feature){
               var f = feature
               // if f is an array itself, assume that upstream set
               // things up properly
               if(! _.isArray(feature)){
                   // form a feature object that couchquery expects
                   f = {'properties':feature}
                   f.properties.ts = start_end.start.getTime()/1000
                   f.properties.endts = start_end.end.getTime()/1000
               }
               feature_queue.push(f)
           })
        feature_queue.drain=function(){
            return res.end()
        }
    return null
}
