/* global require console process it describe after before */

var should = require('should')

var async = require('async')
var _ = require('lodash')
var superagent = require('superagent')
var express = require('express')
var http = require('http')

var csv = require('csv')

var env = process.env
var puser = env.PSQL_TEST_USER
var ppass = env.PSQL_TEST_PASS
var phost = env.PSQL_TEST_HOST
var pport = env.PSQL_TEST_PORT || 5432
var pdb = env.PSQL_TEST_DB

var testport = env.TEST_PORT || 3000
var testhost = env.TEST_HOST || '127.0.0.1'


var query_service = require('../.').area_query_service

testport += 2
describe('couchCache get',function(){
    describe('get by detector', function(){


        var app,server;

        before(
            function(done){
                app = express()
                query_service(app,{prefix:'hoppityhop'
                                  ,host : phost
                                  ,port : pport
                                  ,user : puser
                                  ,pass : ppass
                                  ,db   : pdb
                                  })
                server=http
                       .createServer(app)
                       .listen(testport,testhost,done)

            })
        after(function(done){
            server.close(done)
        })

        it('should spit out a list of detectors in the area when called via json'
          ,function(done){
               // load the service for vds shape data
               superagent.get('http://'+ testhost +':'+testport+'/hoppityhop/counties/link_level/monthly/2009/06019.json')
               .set({'headers':{'accept':'application/json'}
                    ,'followRedirect':true})
               .end(function(e,r){
                   if(e) return done(e)
                   r.should.have.status(200)
                   var c = r.body
                   c.should.have.property('length',166)
                   var did = {}
                   _.each(c
                         ,function(record){
                              record.should.have.property('id')
                              did.should.not.have.property(record.id)
                              did[record.id]=1
                          })
                   return done()
               })
           })

        it('should spit out a list of data in the area when called via csv'
          ,function(done){
               // load the service for vds shape data
               superagent.get('http://'+ testhost +':'+testport+'/hoppityhop/counties/link_level/monthly/2009/06019.csv')
               .set({'headers':{'accept':'text/csv'}
                    ,'followRedirect':true})
               .end(function(e,r){
                   if(e) return done(e)
                   r.should.have.status(200)
                   var c = r.text
                   var detector_time_hash={}
                   var detector_hash={}
                   csv()
                   .from(c, {columns: true} )
                   //.to.path( "./test/string_to_stream.tmp" )
                   .on( 'record', function(record, index){
                       record.should.have.property('time stamp')
                       record.should.have.property('detector')
                       if(record['time stamp'] && record['detector']){
                           var key = [record['time stamp'],record.detector].join('_')
                           detector_time_hash.should.not.have.property(key)
                           detector_time_hash[key]=1
                       }
                       if(record['detector']) detector_hash[record.detector] = 1
                   })
                   .on('end',function(count){
                       var numdetectors =_.size(detector_hash)
                       numdetectors.should.eql(99)
                   })
                   //console.log(c)
                   return done()
               })
           })

    })
})
