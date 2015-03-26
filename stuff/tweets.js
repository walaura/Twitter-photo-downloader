var colors = require('colors'),
    downloader = require('./downloader.js');

var parseMedia = function(media,originalTweet,callback) {
	
	if(media.media_url.substr(0,1) === '/') {
		callback(media);
		return;
	}
	
	var extension = media.media_url.split('.').pop();
	var filename  = (new Buffer(media.media_url).toString('base64'));
	var path      = paths.media+filename+'.'+extension;
	
	
	var download  = downloader.get(media.media_url,path);
	download.on('success',function(response){
		media.media_url = path;
		callback(media);
	});
	download.on('error',function(response){
		if(response.statusCode === 404) {
			console.log(('[FAIL] Tweet was deleted'
			+"\n       http://twitter.com/"+originalTweet.user.screen_name+'/status/'+originalTweet.id
			+"\n       "+originalTweet.text).red);
		} else {
			console.log(('[FAIL] ¿?¿?¿? ('+response.statusCode+')'
			+"\n       http://twitter.com/"+originalTweet.user.screen_name+'/status/'+originalTweet.id
			+"\n       "+originalTweet.text).red);
		}
		callback(media);
	});
	
}

var loop = function(month,tweets,callback) {
	var total = 0;
	var totalWithMedia = 0;
	var totalWithMediaAndFinished = 0;
	var hasAnyMedia = false;
	var calledBack = false;
	
	var onParsedMedia = function(){
		if(total === tweets.length && totalWithMediaAndFinished === totalWithMedia) {
			callback(month,tweets)
		}
	}
	
	tweets.map(function(tweet){
		total++;
		if(tweet.entities.media && tweet.entities.media.length > 0) {
			hasAnyMedia = true;
			tweet.entities.media.map(function(media){
				totalWithMedia++;
				parseMedia(media,tweet,function(newMedia){
					media = newMedia;
					totalWithMediaAndFinished++;
					onParsedMedia();
				});
			});	
		}
		onParsedMedia();
	});
}

module.exports.loop = loop;