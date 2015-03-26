var request = require('request'),
    fs = require('fs');




var get = function(url,to){
	
	var _on = {};
	var rq = request.get(url);
	
	rq.on('error', function(err) {
		console.log(err)
	})
	
	rq.on('response', function(response) {
		if(response.statusCode === 200) {
			
			var dateStr = (new Date(response.caseless.dict['last-modified']))/1000;
			var stream = fs.createWriteStream( to );
			
			rq.pipe(stream);
			stream.on('close',function(){
				fs.utimes(to, dateStr, dateStr,function(){});
			})
			
			if(_on.success) _on.success(response);
			
		} else {
			
			if(_on.error) _on.error(response);
			
		}
	})
	
	
	return {
		on: function(what,callback) {
			_on[what] = callback;
		}
	}
	
}

module.exports.get = get;