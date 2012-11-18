all: npm jshint minify

npm: 
	@echo "Updating node modules"
	@npm install
	@npm update

minify:
	@echo "Minifying javascript"
	@node_modules/.bin/uglifyjs backbone.poller.js > backbone.poller.min.js

jshint: 
	@echo "Running a javascript linter"
	@node_modules/.bin/jshint --config test/jshint.json backbone.poller.js