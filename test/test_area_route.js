/* global require console process it describe after before */

var should = require('should')

var async = require('async')
var _ = require('lodash')
var superagent = require('superagent')
var express = require('express')
var http = require('http')
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
                   c.should.have.property('length')
                   console.log(c.length)

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
                   console.log(c)
                   return done()
               })
           })

    })
})
