# Twitter Photo Downloader
Download all (available) photos on your twitter archive.

# Usage
	$ npm install
	$ node app.js --help

Download your Twitter archive from your [account page](https://twitter.com/settings/account), unzip it and run TPD giving the top archive folder (the one with index.html, data and lib folders) as the -a argument. By default only errors will be shown.

Once the script is done, your browseable tweet archive will contain all your photos locally intead of pulling them form twitter.com. The image files will be on the data/media folder if you need them.

# FAQ
## Are videos and gifs downloaded too?
Nope, for videos and gifs twitter only provides a png still frame. There might be a way around this by scraping the linked page but for now, you'll only get a PNG

## And photos from RTs?
Surprisingly yeah. Enjoy all those buzzfeed posts and emergency kittens littering your image folder

## What about image galleries?
Yup, all files on multiphoto tweets are downloaded
