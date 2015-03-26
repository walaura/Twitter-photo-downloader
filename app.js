var mkdirp = require('mkdirp'),
    fs = require('fs'),
    cliArgs = require("command-line-args"),
    requireDir = require("require-dir"),
    tweets = require('./stuff/tweets.js');
    
var cli = cliArgs([
    	{ name: "archive", alias: "a", type: String, description: "(REQUIRED) Path to your twitter archive" },
    	{ name: "dry", type: Boolean, description: "Do not rewrite archive, just download photos" },
		{ name: "help", type: Boolean, description: "Print usage instructions" },
    ]),
    options = cli.parse();




if(!options.archive || options.help) {
	
	console.log(cli.getUsage({
		header: 'Twitter photo downloader'
	}));
	process.exit(1);
	
}
else {
	
	Grailbird = {};
	Grailbird.data = {};
	paths = {
		tweets: options.archive+'/data/js/tweets/',
		media:  options.archive+'/data/media/'
	}
	
	requireDir(paths.tweets);
	
	mkdirp(paths.media,function(){
		for(var month in Grailbird.data) {
			tweets.loop(month,Grailbird.data[month],function(month,data){
				if(!options.dry) {
					var pack = 'Grailbird.data.'+month+' = '+"\n"+JSON.stringify(data, null, "\t");
					var file = month.substr(7);
					fs.writeFile(paths.tweets+file+'.js', pack, function(){
						console.log(('[PACK] repacked tweets for '+file).green);
					});
				}
			});
		}
	});
	
}