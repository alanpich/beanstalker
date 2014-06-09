/**
 *
 * @constructor
 */
var Worker = module.exports = function(connection,conf,fn){

    this._connection = connection;
    this._fn = fn;
    this.conf = conf;

    this.running = false;

    this.info = {
        status: 'STOPPED',
        completed: 0,
        errors: 0,
        uptime: 0,
        totalTime: 0,
        averageTime: 'n/a'
    }


};


/**
 * Start the worker running
 *
 * @returns void
 */
Worker.prototype.start = function(){
    this.running = true;
    this.info.status = 'WAITING';
    _tick.apply(this);
};


/**
 * Stop the worker at the end of the current cycle
 *
 * @returns void
 */
Worker.prototype.stop = function(){
    this.running = false;
    this.info.status = 'STOPPED';
};




function _tick(){
    if(this.running){
        var conf = this.conf;
        // Request a job from the server
        this._connection.reserve(function(err,jobid,payloadBuffer){
            err? this._fn(err):null;

            this.info.status = 'RUNNING';
            this.info.startTime = new Date().getTime();


            // Decode JSON buffer
            var data = JSON.parse(payloadBuffer.toString());
            if(!data){
                console.log('errorred');
                this._fn('Unable to decode job data');
                return;
            }



            var doneFunction = function(err){
                // Augment the moving average
                ++ this.info.completed;
                var now = new Date().getTime(),
                    startTime = this.info.startTime,
                    totalTime = this.info.totalTime,
                    thisTime = now - startTime,
                    total = this.info.completed,
                    newAverage = (totalTime + thisTime) / total;
                this.info.averageTime = total? newAverage : 'n/a';
                this.info.totalTime += thisTime;
                this.info.status = 'WAITING';
                this.info.uptime = now - startTime;

                if(err){
                    ++ this.errors;
                    this._connection.release(jobid,undefined,undefined,function(err){
                        setTimeout(_tick.bind(this),conf.wait)
                    })
                } else {
                    // Mark the job as completed
                    this._connection.destroy(jobid,function(err){
                        setTimeout(_tick.bind(this),conf.wait)
                    }.bind(this));
                }

            }.bind(this);
            this._fn(null,data,doneFunction);

        }.bind(this));
    }
}


function round(num,points){
    // Increase by points
    var n = num * 10^points;
    return Math.round(n) / points;
}
