/*global JSON exports */
var csv = require('csv')
var _ = require('lodash')

/** buildCSV assumes the passed doc is a json object that is what I expect.
 * it will process the json, into an array suitable for dumping as csv
 * will send to the passed callback (second arg).
 */

function build_csv(options,cb){
    var header_row
    var column_names = options.columns ? options.columns : {}

    var default_header = options.default_header

    var total_data_idx = -1
    var writestream = options.writestream

    function write_something(docid, datacols){
        total_data_idx++
        writestream.write([total_data_idx,docid]
                              .concat(
                                  _.map(header_row
                                       ,function(k){
                                            return '';
                                        })
                              )
                         );
    }
    return function(err,doc){

        if (err){
            return cb(err);
        }
        var fcoll = doc
        if(_.isString(doc)){
            fcoll=JSON.parse(doc);
        }
        var props = fcoll.properties;
        var rows = 0;
        var datacols=[];
        var features_length = 1
        if(props === undefined) features_length=0
        if(features_length){
            // header row
            datacols = fcoll.header;
        }
        if(header_row === undefined && (!datacols || !datacols.length)){
            // dump an error and return
            //console.log('no data for header available in document')
            if(default_header !== undefined){
                datacols = default_header
            }else{
                return cb(null);
            }
        }
        if(header_row === undefined){
            header_row =_.flatten( _.map(['i'].concat(datacols)
                                        ,function(key){
                                             return column_names[key] || key
                                         }))

            writestream.write(header_row)
            // for later usage
            header_row.shift()
            header_row.shift()
            //console.log(header_row)
        }

        // handle detectors special
        var detectors = datacols.pop()
        if(detectors !== 'detectors'){
            datacols.push(detectors)
            detectors = null
        }else{
            detectors = datacols.length
        }


        if(props.data !== undefined && _.isArray(props.data) && props.data.length > 0){
            var datalen = props.data.length;
            for (var dataidx = 0; dataidx < datalen; dataidx++){
                total_data_idx++
                var width = props.data[dataidx].length
                var entry = [total_data_idx]
                entry = entry.concat(
                    datacols.map(function(key,idx){
                        if(props.data[dataidx] === undefined
                         || props.data[dataidx][idx] === undefined){
                            return '';
                        }else{
                            return props.data[dataidx][idx] ;
                        }
                    })
                )
                if(detectors){
                    //console.log('handle detectors, slice from '+detectors + ':'+width )
                    entry = entry.concat(
                        props.data[dataidx].slice(detectors,width)
                    )
                }
                writestream.write(entry)
                rows++
            }
        }else{
            // no data
            write_something(fcoll.docid,datacols)
        }
        return null
    }

}

exports.build_csv=build_csv
