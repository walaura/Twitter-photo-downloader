# Twitter Photo Downloader
Download all (available) photos on your twitter archive.

# Usage
	$ npm install
	$ node app.js --help

Download your Twitter archive from your [account page](https://twitter.com/settings/account), unzip it and run TPD giving the top archive folder (the one with index.html, data and lib folders) as the -a argument.

Once the script is done, your browsable tweet archive will contain all your photos locally intead of pulling them form twitter.com. The image files will be on the data/media folder if you need them.

*Note:* Sometimes you'll get 404 errors on some tweets that still exist, that's twitter acting up. Just wait a couple of hours and run the script again. Or follow the links to get the photos yourself

# TODO
* Right now on some macs the whole thing just falls apart from too many fs writes it would be ideal to queue that up but i dont wanna deal with streams ever
* Put this on npm maybe iunno

Contributions are ✨ super welcome ✨

# FAQ
## Are videos and gifs downloaded too?
Nope, for videos and gifs twitter only provides a png still frame. There might be a way around this by scraping the linked page but for now, you'll only get a PNG

## And photos from RTs?
Surprisingly yeah. Enjoy all those buzzfeed posts and emergency kittens littering your image folder

## What about image galleries?
Yup, all files on multiphoto tweets are downloaded
