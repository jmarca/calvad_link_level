var winston = require("winston");
// set up logging per: https://gist.github.com/spmason/1670196
var logger = new winston.Logger()
var production = (process.env.NODE_ENV || '').toLowerCase() === 'production';
// express/connect also defaults to looking at env.NODE_ENV

var loglevel = process.env.USEREDIT_LOGLEVEL || process.env.LOGLEVEL
var path = require('path')
var logfile = path.normalize(__dirname+'/application.log')

if(loglevel===undefined) loglevel='debug'
switch(production){
    case 'production':
    production = true
    loglevel='warn'
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
    loglevel='debug'
    logger.add(winston.transports.Console,
               {colorize: true
               ,timestamp: true
               ,level: loglevel
               ,label: 'detector_postgis_query'
               });
    break
    default:
    loglevel = 'info'
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
