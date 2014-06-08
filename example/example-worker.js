module.exports = function(err,data,done){

    if(err){
        console.log('[ERROR] '+err);
    }

    setTimeout(function(){
        done(err);
    },2000)
};
