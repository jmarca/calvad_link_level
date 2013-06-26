/* global require console process it describe after before */

var should = require('should')

var async = require('async')
var _ = require('lodash')

var couch_cacher= require('calvad_couch_cacher')
var reducer= require('calvad_reducer').reducer


var ts = new Date(2008,6,25,13,0).getTime()/ 1000
var endts =  new Date(2008,6,25,15,0).getTime()/1000

describe('couchCache get',function(){
    describe('monthly, by detector', function(){
        it('can get something',function(done){
            var accum = reducer({'time_agg':'monthly'
                                ,'spatial_agg':sagg});
            var sagg = 'detector'
            var cacher = couch_cacher.couchCache()

            var getter = cacher.get(accum.process_collated_record)
            async.parallel([function(cb){
                                var feature = {'properties':{'detector_id':'1013410'
                                                            ,'ts':ts
                                                            ,'endts':endts
                                                            }}

                                getter(feature
                                      ,function(e,d){
                                           cb(e)
                                       });
                            }
                           ,function(cb){
                                endts =  new Date(2008,8,25,15,0).getTime()/1000

                                var feature = {'properties':{'detector_id':'1010510'
                                                            ,'ts':ts
                                                            ,'endts':endts
                                                            }}
                                getter(feature
                                      ,function(e,d){
                                           cb(e)
                                       })
                            }]
                          ,done)

        })
    })
})
