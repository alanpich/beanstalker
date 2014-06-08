var BeanWorkers = require('./../index'),
    workerFn = require('./example-worker'),
    terminal = require('node-terminal'),
    formatTime = require('./format-time');


/**
 * Configuration for the worker connection
 *
 */
var conf = {
    server: {
        tube: 'pdf',
        host: '127.0.0.1',
        port: 11300
    },
    timeout: 10000,
    wait: 0
};


/**
 *  Connect to a Beanstalkd server and create a Worker
 */
BeanWorkers.createWorker(conf,workerFn,function(err,worker){

    /**
     * Errors here mean that something bad happenned before the
     * worker was initialised. This is a bad thing, you should
     * probably try to handle the error rather than trying to
     * start the worker
     */
    if(err){
        console.log('[ERROR] '.red + err);
        return;
    }
    var startTime = Date.now(),
        info = worker.info;


    /**
     * Start the worker
     */
    worker.start();


    /**
     * Output live updates in the console
     */
    setInterval(function(){
        terminal
            .clear()
            .move(0,0);
        var uptime = formatTime(Math.round(Date.now() - startTime),true),
            slug = worker._connection.slug;


        terminal.write('----------------------------').nl();
        terminal.write('> '+slug).nl();
        terminal.write('----------------------------').nl();
        terminal.write('  Status:         '+info.status).nl();
        terminal.write('  Uptime:         '+uptime).nl();
        terminal.write('  Completed jobs: '+info.completed).nl();
        terminal.write('  Average time:   '+formatTime(info.averageTime)).nl();
        terminal.write('----------------------------').nl();
    },1000);

});

