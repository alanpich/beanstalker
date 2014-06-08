var SECOND = 1000,
    MINUTE = SECOND * 60,
    HOUR   = MINUTE * 60,
    DAY    = HOUR * 24;



module.exports = function(ms, round){

    ms = ms || (ms = 0);
    round = round || (round = false);

    var days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0;

    if(ms > DAY){
        days = Math.floor(ms / DAY);
        ms -= days * DAY;
    }

    if(ms > HOUR){
        hours = Math.floor(ms/HOUR);
        ms -= hours * HOUR;
    }

    if(ms > MINUTE){
        minutes = Math.floor(ms/MINUTE);
        ms -= minutes * MINUTE;
    }

    seconds = ms / 1000;
    if(round){
        seconds = Math.round(seconds);
    }


    var str = '';
    if(days){
        str+= days+'d ';
    }
    if(hours){
        str+= hours+'h ';
    }
    if(minutes){
        str+= minutes+'m ';
    }
    str+= seconds+'s';
    return str;

}
