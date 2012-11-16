# Backbone Poller
Backbone poller is a simple utility that allows polling on any Backbone model or collection.

Some modern browsers and servers support Web Sockets or long polling (comet) and allow advanced polling models.

However, in many cases it is sufficient to run a standard http request every few seconds to keep the client synced with the server. For instance, basic operations such as checking for new messages in a mailbox.

Backbone poller helps with these cases:

- Allows you to poll without extending your base backbone models or collections
- Is 100% compliant with any Backbone model or collection.

The [annotated source code](<http://uzikilon.github.com/backbone-poller/>) is available, as well as an online [test suite](<http://uzikilon.github.com/backbone-poller/test/SpecRunner.html>).

### Downloads (Right-click, and use "Save As")

- [Development Version](<https://raw.github.com/uzikilon/backbone-poller/master/backbone.poller.js>)    4.5kb, Uncompressed with Comments
- [Production Version](<https://raw.github.com/uzikilon/backbone-poller/master/backbone.poller.min.js>)   1.1kb, Minified and Gzipped


## Basic Usage:
``` javascript
// to initialize:
var poller = Backbone.Poller.get(model_or_collection);
poller.start()

// or
var poller = Backbone.Poller.get(model_or_collection).start()

// to stop:
poller.stop();

```

### Advanced Optional Options:
``` javascript
var options = {
  // default delay is 1000ms
  delay: 300, 
  // condition for keeping polling active (when this stops being true, polling will stop)
  condition: function(model){
      return model.get('active') === true;
  },
   // We can pass data to a fetch request
  data: {fields: "*", sort: "name asc"}
}

var poller = Backbone.Poller.get(model_or_collection, options);

// We can assign callbacks later on
poller.on('success', function(model){
  console.info('another successful fetch!'); 
});
poller.on('complete', function(model){
  console.info('hurray! we are done!');
});
poller.on('error', function(model){
  console.error('oops! something went wrong'); 
}

poller.start()

// to stop
poller.stop();

// or make the conditional function return false
model.set('active', false);

// check if poller is running
if (poller.active()) {
// ...
}

// We can alter options
poller = Backbone.Poller.get(model_or_collection, [other_options]).start();
// or
poller.set([other_options]).start();
// Note: altering options will stop the current runnig poller and will require manual start

```

## Copyrights
Copyright (c) 2012 Uzi Kilon, Splunk Inc.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.