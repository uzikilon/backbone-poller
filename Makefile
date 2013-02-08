all: npm jshint minify.code

npm: 
	@echo "`date`\tUpdating node modules"
	@npm install
	@npm update

minify.code:
	@echo "`date`\tMinifying javascript"
	@node_modules/.bin/uglifyjs --comments="/\(c\)/" backbone.poller.js > backbone.poller.min.js

jshint: 
	@echo "`date`\tRunning a javascript linter"
	@node_modules/.bin/jshint --config test/jshint.json backbone.poller.js