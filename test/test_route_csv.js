/* global require console process it describe after before */

var should = require('should')

var async = require('async')
var _ = require('lodash')
var superagent = require('superagent')
var express = require('express')
var http = require('http')
var testport = process.env.TEST_PORT || 3000
var testhost = process.env.TEST_HOST || '127.0.0.1'

var query_service = require('../.').query_service

testport += 1
describe('couchCache get',function(){
    describe('get by detector', function(){


        var app,server;

        before(
            function(done){
                app = express()
                query_service(app,'hoppityhop')

                server=http
                       .createServer(app)
                       .listen(testport,testhost,done)

            })
        after(function(done){
            server.close(done)
        })

        it('should spit out csv monthly data by freeway'
          ,function(done){
               // load the service for vds shape data
               superagent.get('http://'+ testhost +':'+testport+'/hoppityhop/freeway/monthly/2008/1013410.csv')
               .end(function(e,r){
                           if(e) return done(e)
                           r.status.should.equal(200)
                           var b = r.text
                           should.exist(b)
                           // not much of a test.
                           //console.log(b)
                           return done()
                       })
           })
        it('should spit out csv daily data by freeway'
          ,function(done){
               // load the service for vds shape data
               superagent.get('http://'+ testhost +':'+testport+'/hoppityhop/freeway/daily/2008/1013410.csv')
               .end(function(e,r){
                           if(e) return done(e)
                           r.status.should.equal(200)
                           var b = r.text
                           should.exist(b)
                           // not much of a test.
                           //console.log(b)
                           return done()
                       })
           })
        it('should skip not freeway, not detector'
          ,function(done){
               // load the service for vds shape data
               superagent.get('http://'+ testhost +':'+testport+'/hoppityhop/county/monthly/2008/1013410.csv')
               .end(function(e,r){
                   if(e) return done(e)
                   r.statusCode.should.equal(404)
                   return done()
               })
           })

    })
})
