//实现与数据库的交互
var mysql = require('mysql'),
    $conf = require('../conf/db'),
    $sql = require('./userSqlMapping');

var xss = require('xss');

var matchRegExp = {
    name : '^[\\u4e00-\\u9fa5]{0,}$',
    stNumber : '^\\d{8}$',
    telNumber : '^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|17[0-9]|18[0|1|2|3|5|6|7|8|9])\\d{8}$'
};


function checkFormat(req) {
    if(!new RegExp(matchRegExp.name).test(req.body.name))
        return false;
    if(!new RegExp(matchRegExp.stNumber).test(req.body.stNumber))
        return false;
    if(!new RegExp(matchRegExp.telNumber).test(req.body.telNumber))
        return false;
    return true;
}


//使用连接池,提升性能
var pool = mysql.createPool($conf.mysql);


var methods = {
    //向数据库添加记录
    add : function (req, res, callback) {
        if(!checkFormat(req)) {
            return callback(null, { code : 1 , msg : '输入格式错误'});
        }
        methods.checkNameOrSN(req, res, function (err, code) {
            if(err) {
                return callback(err, null);
            }
            if(code === 1){
                return callback(null, { code : code , msg : '姓名或学号已被注册'});
            } else if (code === 2) {
                pool.getConnection(function (err, connection) {
                    //获取前台页面传过来的数据
                    var param = req.body;
                    var paramArray = [];

                    //var iconv = new Iconv('GBK', 'UTF-8');

                    for(var key in param) {
                        if(param.hasOwnProperty(key)) {
                            param[key] = xss(param[key]);
                            paramArray.push(param[key]);
                        }
                    }
                    //建立连接
                    //'INSERT INTO USER'
                    connection.query($sql.insert, paramArray, function (err, result) {
                        if (err) {
                            return callback(err, null);
                            connection.release();
                        } else {
                            if (result) {
                                callback(null, { code : code , msg : param});
                            }

                            //以json形式, 把操作结果返回给前台页面
                            //释放连接

                            connection.release();
                        }

                    });
                });

            }

        });

    },

    checkNameOrSN : function (req, res, callback) {
        pool.getConnection(function (err, connection) {
            if(err) {
                return callback(err, null);
            }
            var param = req.body;
            var select = '';
            /*if(param.name) {
             select = "select users.name from users where users.name=" + "'" + param.name + "'";
             connection.query(select, function (err, result) {
             if(err) {
             callback(err, null);
             }
             if(result.length > 0) {
             //表示存在这个name
             callback(null, 1);
             } else {
             //表示不存在这个name
             callback(null, 2);
             }
             connection.release();
             });
             } else */ if (param.stNumber) {
                select = "select users.stNumber from users where users.stNumber=" + "'" + param.stNumber + "'";
                connection.query(select, function (err, result) {
                    if(err) {
                        callback(err, null);
                    }
                    if(result.length > 0) {
                        //res.redirect('http://baidu.com');
                        //表示存在这个name
                        callback(null, 1);
                    } else {
                        //表示不存在这个name
                        callback(null, 2);
                    }
                    connection.release();
                });
            }
        });
    }

};

module.exports = methods;