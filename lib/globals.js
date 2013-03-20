
var tspat_for_date_create = new RegExp("(.*)-0?(.*)-0?(.*) 0?(.*):0?(.*):");
var tspat = /(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d)/;

var variable_order = {'count':0
                     ,'imputations':1
                     ,'n':2
                     ,'o':3
                     ,'heavyheavy':4
                     ,'hh_speed'  :5
                     ,'hh_weight' :6
                     ,'hh_axles':7
                     ,'not_heavyheavy':8
                     ,'nhh_speed':9
                     ,'nhh_weight':10
                     ,'nhh_axles':11
                     ,'wgt_spd_all_veh_speed':12
                     ,'count_all_veh_speed':13};


var n_weighted_variables = ['o'
                           ,'avg_veh_spd'];
var hh_weighted_variables = ['avg_hh_weight'
                            ,'avg_hh_axles'
                            ,'avg_hh_spd'];
var nh_weighted_variables = ['avg_nh_weight'
                            ,'avg_nh_axles'
                            ,'avg_nh_spd'
                            ];

exports.tspat = tspat
exports.tspat_for_date_create = tspat_for_date_create
exports.variable_order         = variable_order;
exports.n_weighted_variables  = n_weighted_variables;
exports.hh_weighted_variables = hh_weighted_variables;
exports.nh_weighted_variables = nh_weighted_variables;
