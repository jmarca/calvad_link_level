/*global exports */
// small utility to get a date range from a passed in year, year&month


function get_time(req,ts,endts){
    ts = ts ? ts :  'ts';
    endts = endts ? endts :  'endts';
    var startend={};
    var start;
    var end;
    var yr = +req.params.year;
    if(yr && req.params.month){
        // new Date(year, month, day, hours, minutes, seconds, ms)
        start = new Date(yr,req.params.month - 1,1,0,0,0);
        end   = new Date(yr,req.params.month,1,0,0,0);
    }else{
        // get a whole year
        start = new Date(yr  ,0,1,0,0,0);
        end   = new Date(yr+1,0,1,0,0,0);
    }
    startend.start=start;
    startend.end=end;
    startend.startend =  [
        endts+" >= to_timestamp("+start.getTime()/1000+")"
      ,ts+" <  to_timestamp("+end.getTime()/1000+")"
    ].join(' and ');

    // handle aggregation level
    var aggregate = 'hourly' // default to hourly
    if(req.params.aggregate){
        aggregate = req.params.aggregate;
    }

    return startend;
}
exports.get_time = get_time
