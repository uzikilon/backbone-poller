all: npm test.unit test.lint minify.code

npm: 
	@echo "`date`\tUpdating node modules"
	@npm install
	@npm update

minify.code:
	@echo "`date`\tMinifying javascript"
	@node_modules/.bin/uglifyjs --comments="/\(c\)/" backbone.poller.js > backbone.poller.min.js

test.lint:
	@echo "`date`\tRunning a javascript linter"
	@node_modules/.bin/jshint --config test/jshint.json backbone.poller.js

test.unit:
	@echo "`date`\tRunning unit tests"
	@phantomjs test/lib/phantomjs-test-runner.js test/SpecRunner.html

docs:
	@echo "`date`\tCreating annotated source code"
	@docco backbone.poller.js
	@mv docs/backbone.poller.html index.html
	@rm -rf docs
