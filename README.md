# Backbone Poller
Backbone poller is a simple utility that allows polling on any Backbone model or collection.

Some modern browsers and servers support Web Sockets or long polling (comet) and allow advanced polling models.

However, in many cases it is sufficient to run a standard http request every few seconds to keep the client synced with the server. For instance, basic operations such as checking for new messages in a mailbox.

Backbone poller helps with these cases:

- Allows you to poll without extending your base backbone models or collections
- Is 100% compliant with any Backbone model or collection.

The [annotated source code](<http://uzikilon.github.com/backbone-poller/>) is available online.

### Downloads (Right-click, and use "Save As")

- [Development Version](<https://raw.github.com/uzikilon/backbone-poller/0.2.7/backbone.poller.js>)    4.6kb, Uncompressed with Comments
- [Production Version](<https://raw.github.com/uzikilon/backbone-poller/0.2.7/backbone.poller.min.js>)   1.8kb, Minified and Gzipped


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

### AMD loader:
``` javascript
require(['path/to/backbone.poller', 'path/to/Collection'], function(Poller, Collection) {
  var collection = new Collection();
  var poller = Poller.get(collection).start();
});
```

## Advanced Optional Options:

### Altering default options:
``` javascript
var options = {

  // default delay is 1000ms
  delay: 300,

  // run after the first delay. defaults to false
  delayed: true,

  // condition for keeping polling active (when this stops being true, polling will stop)
  condition: function(model){
      return model.get('active') === true;
  },

  // We can pass data to a fetch request
  data: {fields: "*", sort: "name asc"}
}
var poller = Backbone.Poller.get(model, options);
```

### Register event listeners:
``` javascript
var poller = Backbone.Poller.get(model);
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
```
### Stopping the poller:
To stop we can manually call `poller.stop()` or we can make the conditional function return false:
``` javascript
var poller = Backbone.Poller.get(model);
poller.stop() // manually stops the poller

var options = {
  condition: function(model){
      return model.get('active') === true;
  }
};
var poller = Backbone.Poller.get(model, options);
model.set('active', false); // will programmatically stop the poller
```

### Check status:
``` javascript
var isActive = poller.active() // boolean;
```

### Alter poller options:
Altering options will stop the current running poller and will require manual start.
This method removes **all** existing options and set the new options assigned.
``` javascript
var poller = Backbone.Poller.get(model, {delay: 100}).start();

// stops the poller, replaces the options, and then starts
poller.set({delay: 300}).start();
```

### Stop and destroy all pollers
``` javascript
Backbone.Poller.reset();
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
