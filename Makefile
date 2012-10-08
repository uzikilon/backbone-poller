all:
	echo "Minifying JS"
	@node_modules/.bin/uglifyjs backbone.poller.js > backbone.poller.min.js