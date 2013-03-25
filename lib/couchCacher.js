/* global JSON console require process */
var superagent = require('superagent')
var _ = require('lodash')
var globals=require('./globals.js')
var env = process.env
var cuser = env.COUCHDB_USER
var cpass = env.COUCHDB_PASS
var chost = env.COUCHDB_HOST
var cport = env.COUCHDB_PORT || 5984

var couch = 'http://'+chost+':'+cport;
1
var couchCache = function(opts){
    if(opts===undefined) opts = {};
    var years = opts.years || [2007,2008,2009,2010,2011,2012,2013];
    var districts = ['d01','d02','d03','d04','d05','d06'
                    ,'d07','d08','d09','d10','d11','d12'
                    ,'wim','hpms'];

    // need aggregation level in opts, default to monthly
    var time_agg = opts.time_agg || 'monthly'
    if(_.indexOf(['monthly','weekly','daily','hourly'],time_agg) === -1) throw new Error('bad agg level '+opts.time_agg)

    var spatial_agg = opts.spatial_agg || 'freeway'
    if(_.indexOf(['freeway','detector'],spatial_agg) === -1) throw new Error('bad agg level '+opts.spatial_agg)

    function make_ts_key(doc){
        var tsres = globals.tspat.exec(doc.ts);
        if(time_agg === 'monthly') return [tsres[1],tsres[2]].join("-")
        if(time_agg === 'daily') return [tsres[1],tsres[2],tsres[3]].join("-")
        if(time_agg === 'hourly') return [tsres[1],tsres[2],tsres[3]].join("-") + ' ' + [tsres[4],'00'].join(":")

        if(time_agg === 'weekly') throw new Error('weekly aggregates not implemented ye')
        return null
    }
    function make_fwy_key(doc){
        if(spatial_agg === 'detector') return doc.detector_id
        if(spatial_agg === 'freeway')  return doc.fwy
        return null
    }

    // create a per instance caching thing that is local to the local job
        var bins={};
        function reset(){
            // stuff all of data into couchdb
            // based on year, detector id determines which couchdb to store
            // previously hardcoded this:
            // bins = {'d01':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'d02':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'d03':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'d04':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'d05':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'d06':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'d07':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'d08':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'d09':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'d10':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'d11':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'d12':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        ,'wim':{'2007':[],'2008':[],'2009':[],'2010':[]}
            //        };
            _.forEach(districts
                     ,function(d){
                          if(bins[d] !== undefined){
                              delete bins[d]
                          }
                          bins[d] = {}
                          _.forEach(years
                                   ,function(y){
                                        bins[d][y]=[]
                                    })
                      });

        };


        function get(reducer){
            return function(feature,next){
                // if no next, make a placeholder
                if(next === undefined){
                    next = function(){return null;}
                }
                var did = feature.properties.detector_id
                var numericpart = did.match(/\d+/);

                // as above, assume vds, then test for wim
                var detector_id = numericpart[0];

                // special handling for WIM
                if(/wim/.exec(did)){
                    // WIM data has a direction
                    var dir = feature.properties.direction
                    if(dir !== undefined){
                        // mash it up
                        detector_id = ['wim',numericpart[0],dir.charAt(0).toUpperCase()].join('.');
                    }else{
                        detector_id=feature.properties.detector_id
                    }
                }

                var start = new Date(1000 * feature.properties.ts);
                var end   = new Date(1000 * feature.properties.endts);

                // document id pattern is 715898-2009-01-01 04:00, so make from and to accordingly

                var query = {'reduce':false
                            ,'inclusive_end':true
                            ,'include_docs':true
                            }
                var d = start;

                // define the doc key
                query.startkey = [[detector_id
                                  ,d.getFullYear()+''
                                  ,globals.pad(d.getMonth()+1)+''
                                  ,globals.pad(d.getDate())+''].join('-')
                                 ,[globals.pad(d.getHours())+'','00'].join(':')
                                 ].join(' ');
                d = end;
                query.endkey = [[detector_id
                                ,d.getFullYear()+''
                                ,globals.pad(d.getMonth()+1)+''
                                ,globals.pad(d.getDate())+''].join('-')
                               ,[globals.pad(d.getHours())+'','00'].join(':')
                               ].join(' ');
                // convert to a real query string
                query = globals.toQuery(query)

                var year = start.getFullYear()
                var district = globals.district_from_detector(detector_id)
                var couch_database = ['imputed','collated',district,year].join('%2f')
                var source = [couch,couch_database].join('/')
                var from = source + '/_all_docs' + '?' + query
                superagent.get(from)
                .set('Content-Type', 'application/json')
                .set('Accept','application/json')
                .set('followRedirect',true)
                .end(function(e,r){
                    if(e) return next(e);
                    var doc = r.body
                    if(doc.rows === undefined || doc.rows.length==0 ){
                        // do nothing
                        return next()
                    }else{
                        // get the values for each row and return
                        var rows = doc.rows;
                        // recall how couchdb works:
                        //                   {"total_rows":3,"offset":0,"rows":[
                        // {"id":"bar","key":"bar","value":{"rev":"1-4057566831"},"doc":{"_id":"bar","_rev":"1-4057566831","name":"jim"}},
                        // {"id":"baz","key":"baz","value":{"rev":"1-2842770487"},"doc":{"_id":"baz","_rev":"1-2842770487","name":"trunky"}}
                        // ]}
                        _.forEach(rows
                                 ,function(row){
                                      // slot in the right spot in data hash

                                      // make tkey, make fkey
                                      var tkey = make_ts_key(row.doc)
                                      var fkey =  make_fwy_key(row.doc)
                                      // if we get bugs later, maybe try deep=true
                                      // reducer is passed in with opts
                                      reducer(tkey,fkey,row.doc)

                                  });
                        return next(null,rows);
                    }
                    return null;
                });

                return null;
            }
        }

        return {'reset':reset
               ,'get':get};

    };

exports.couchCache=couchCache;
