all: npm minify

npm: 
	@echo "Updating node modules"
	@npm install
	@npm update
minify:
	@echo "Minifying JS"
	@node_modules/.bin/uglifyjs backbone.poller.js > backbone.poller.min.js