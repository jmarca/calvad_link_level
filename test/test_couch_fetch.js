/* global require console process it describe after before */

var should = require('should')

var async = require('async')
var _ = require('lodash')

var couch_cacher= require('../lib/couchCacher')
var reducer= require('../lib/reducer')


var ts = new Date(2008,6,25,13,0).getTime()/ 1000
var endts =  new Date(2008,6,25,15,0).getTime()/1000

describe('couchCache get',function(){
    describe('monthly, by detector', function(){
        it('can get something',function(done){
            var accum = reducer();
            var cacher = couch_cacher({'time_agg':'monthly'
                                      ,'spatial_agg':'detector'})

            var getter = cacher.get(accum)
            async.parallel([function(cb){
                                var feature = {'properties':{'detector_id':'1013410'
                                                            ,'ts':ts
                                                            ,'endts':endts
                                                            }}

                                getter(feature
                                      ,function(e,d){
                                           console.log(JSON.stringify(accum.stash_out()))
                                           cb(e)
                                       });
                            }
                           ,function(cb){
                                var feature = {'properties':{'detector_id':'1010510'
                                                            ,'ts':ts
                                                            ,'endts':endts
                                                            }}
                                getter(feature
                                      ,function(e,d){
                                           console.log(JSON.stringify(accum.stash_out()))
                                           cb(e)
                                       })
                            }]
                          ,done)

        })
    })
})
