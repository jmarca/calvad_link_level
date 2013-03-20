/* global require console process it describe after before */

var should = require('should')

var async = require('async')
var _ = require('lodash')
var request = require('request')
var express = require('express')
var http = require('http')
var testport = process.env.TEST_PORT || 3000
var testhost = process.env.TEST_HOST || '127.0.0.1'

var calvad_querier = require('../lib/query_couch')
var get_time = require('../lib/get_time').get_time


describe('couchCache get',function(){
    describe('get by detector', function(){


        var app,server;

        before(
            function(done){
                app = express()
                app.get('/data6/:spatialagg/:aggregate/:year/:detector_id.json'
                       ,function(req,res,next){
                            // build the feature to extract

                            var start_end = get_time(req)
                            var feature = {'properties':{}}
                            feature.properties.ts = start_end.start.getTime()/1000
                            feature.properties.endts = start_end.end.getTime()/1000
                            feature.properties.detector_id = req.params.detector_id
                            req.params['feature'] = feature
                            console.log(req.params)
                            return next()
                        }
                       ,calvad_querier.get_id
                       )

                server=http
                       .createServer(app)
                       .listen(testport,testhost,done)

            })
        after(function(done){
            server.close(done)
        })

        it('should spit out monthly data by detector'
          ,function(done){
               // load the service for vds shape data
               request({'url':'http://'+ testhost +':'+testport+'/data6/detector/monthly/2008/1013410.json'
                       ,'headers':{'accept':'application/json'}
                       ,'followRedirect':true}
                      ,function(e,r,b){
                           if(e) return done(e)
                           r.statusCode.should.equal(200)
                           should.exist(b)
                           var c = JSON.parse(b)
                           c.should.have.property('header')
                           c.should.have.property('properties')
                           c.properties.should.have.property('data')
                           c.properties.data.should.have.property('length',12)
                           c.header[1].should.eql('detector')
                           c.properties.data[1][1].should.eql('1013410')
                           return done()
                       })
           })
        it('should spit out monthly data by freeway'
          ,function(done){
               // load the service for vds shape data
               request({'url':'http://'+ testhost +':'+testport+'/data6/freeway/monthly/2008/1013410.json'
                       ,'headers':{'accept':'application/json'}
                       ,'followRedirect':true}
                      ,function(e,r,b){
                           if(e) return done(e)
                           r.statusCode.should.equal(200)
                           should.exist(b)
                           var c = JSON.parse(b)
                           c.should.have.property('header')
                           c.should.have.property('properties')
                           c.properties.should.have.property('data')
                           c.properties.data.should.have.property('length',12)
                           c.header[1].should.eql('freeway')
                           c.properties.data[1][1].should.eql('205')
                           return done()
                       })
           })
        it('should spit out daily data'
          ,function(done){
               // load the service for vds shape data
               request({'url':'http://'+ testhost +':'+testport+'/data6/detector/daily/2008/1013410.json'
                       ,'headers':{'accept':'application/json'}
                       ,'followRedirect':true}
                      ,function(e,r,b){
                           if(e) return done(e)
                           r.statusCode.should.equal(200)
                           should.exist(b)
                           var c = JSON.parse(b)
                           c.should.have.property('header')
                           c.should.have.property('properties')
                           c.properties.should.have.property('data')
                           c.properties.data.should.have.property('length',366)
                           return done()
                       })
           })


    })
})
