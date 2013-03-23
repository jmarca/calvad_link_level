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

        it('should spit out monthly data by detector'
          ,function(done){
               // load the service for vds shape data
               superagent('http://'+ testhost +':'+testport+'/hoppityhop/detector/monthly/2008/1013410.json')
           .set('Accept','application/json')
           .set('followRedirect',true)
           .end(function(e,r){
                       if(e) return done(e)
                       r.status.should.equal(200)
                           var c = r.body
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
               superagent('http://'+ testhost +':'+testport+'/hoppityhop/freeway/monthly/2008/1013410.json')
           .set('Accept','application/json')
           .set('followRedirect',true)
           .end(function(e,r){
                       if(e) return done(e)
                       r.status.should.equal(200)
                           var c = r.body
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
               superagent('http://'+ testhost +':'+testport+'/hoppityhop/detector/daily/2008/1013410.json')
               .set('Accept','application/json')
               .set('followRedirect',true)
               .end(function(e,r){
                   if(e) return done(e)
                   r.status.should.equal(200)
                   var c = r.body
                   c.should.have.property('header')
                   c.should.have.property('properties')
                   c.properties.should.have.property('data')
                   c.properties.data.should.have.property('length',366)
                   return done()
               })
           })


        it('should spit out csv monthly data by freeway'
          ,function(done){
               // load the service for vds shape data
               superagent('http://'+ testhost +':'+testport+'/hoppityhop/freeway/monthly/2008/1013410.csv')
               .set('Accept','text/csv')
               .set('followRedirect',true)
           .end(function(e,r){
                       if(e) return done(e)
                       r.status.should.equal(200)
                           console.log(r.text)
                           return done()
                       })
           })

    })
})
