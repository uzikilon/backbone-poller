all: npm minify.code test

npm: 
	@echo "`date`\tUpdating node modules"
	@npm install
	@npm update

minify.code:
	@echo "`date`\tMinifying javascript"
	@node_modules/.bin/uglifyjs -m -c --comments="/\(c\)/" backbone.poller.js > backbone.poller.min.js

test.lint:
	@echo "`date`\tRunning a javascript linter"
	@node_modules/.bin/jshint --config test/jshint.json backbone.poller.js

test.unit:
	@echo "`date`\tRunning unit tests"
	@phantomjs test/lib/phantomjs-test-runner.js test/SpecRunner.html
	@echo "`date`\tRunning unit tests on minified code"
	@phantomjs test/lib/phantomjs-test-runner.js test/SpecRunner.min.html

test: test.lint test.unit

docs:
	@echo "`date`\tCreating annotated source code"
	@docco backbone.poller.js
	@mv docs/backbone.poller.html index.html
	@rm -rf docs
	@git add index.html
	@git ci -m "Updated annotated soucre code"
