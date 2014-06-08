var Worker = require('./worker'),
    fivebeans = require('fivebeans');

/**
 *
 * @constructor
 */
var BeanStalker = function(){
    this._connections = {};
};


/**
 * Connects to a specific tube on a Beanstalkd server and
 * returns an object mapped to that tube
 *
 * @returns Queue
 */
BeanStalker.prototype.createWorker = function(conf,fn,cb){
    var ths = this;
    // Get a connection to the server
    ths.getConnection(conf.server,function(err,connection){
        if(err){ cb(err); return }
        var worker = new Worker(connection,conf,fn);
        cb(null,worker);
    });
};



BeanStalker.prototype.getConnection = function(conf, cb){
    var slug = conf.host+':'+conf.port+':'+conf.tube;

    if(this._connections[slug]){
        cb(null,this._connections[slug]);
    } else {
        // Create the connection
        var conn = new fivebeans.client(conf.host,conf.port);
        conn.slug = slug;

        conn.on('error',function(err){
            cb(err);
        },this);


        conn.on('connect',function(err){
            if(err) { cb(err); return }
            conn.use(conf.tube,function(err,tubename){
                if(err) { cb(err); return }
                conn.watch(conf.tube,function(err,tubename){
                    cb(null,conn);
                });
            });
        });


        conn.connect();
        this._connections[slug] = conn;
    }


};


module.exports = new BeanStalker();
