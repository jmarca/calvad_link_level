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


var query_service = require('../.').area_query_service_v2

testport += 2
describe('couchCache get',function(){
})
