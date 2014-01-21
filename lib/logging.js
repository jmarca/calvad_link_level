var winston = require("winston");
// set up logging per: https://gist.github.com/spmason/1670196
var logger = new winston.Logger()
var production = (process.env.NODE_ENV || '').toLowerCase();
// express/connect also defaults to looking at env.NODE_ENV

var loglevel = process.env.USEREDIT_LOGLEVEL || process.env.LOGLEVEL
var path = require('path')
var logfile = path.normalize(__dirname+'/application.log')

if(loglevel===undefined){
    switch(production){
        case 'production':
        loglevel='warn'
        break
        default:
        loglevel='debug'
    }
}
console.log([production,loglevel])
switch(production){
    case 'production':
    loglevel=loglevel
    logger.add(winston.transports.File,
               {filename: logfile
               ,handleExceptions: true
               ,exitOnError: false
               ,level: 'warn'
               ,label: 'detector_postgis_query'
               });
    break
    case 'test':
    // Don't set up the logger overrides
    break
    case 'development':
    loglevel=loglevel
    logger.add(winston.transports.Console,
               {colorize: true
               ,timestamp: true
               ,level: loglevel
               ,label: 'detector_postgis_query'
               });
    break
    default:
    loglevel = loglevel
    logger.add(winston.transports.Console,
               {colorize: true
               ,timestamp: true
               ,level: loglevel
               ,label: 'detector_postgis_query'
               });
    break
    // make loglevels consistent
}
logger.setLevels(winston.config.syslog.levels);

exports.logger = logger
