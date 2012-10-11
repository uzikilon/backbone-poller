# Backbone Poller
Backbone poller is a simple utility that allows polling on any Backbone model or collection.

Some modern browsers and servers support Web Sockets or long polling (comet) and allow advanced polling models.

However, in many cases it is sufficient to run a standard http request every few seconds to keep the client synced with the server. For instance, basic operations such as checking for new messages in a mailbox.

Backbone poller helps with these cases:

- Allows you to poll without extending your base backbone models or collections
- Is 100% compliant with any Backbone model or collection.
- Only 1.17kb minified and gzipped

The project is hosted on [GitHub](<https://github.com/uzikilon/backbone-poller>), and the [annotated source code](<http://uzikilon.github.com/backbone-poller/>) is available, as well as an online [test suite](<http://uzikilon.github.com/backbone-poller/test/SpecRunner.html>).

### Downloads (Right-click, and use "Save As")

- [Development Version](<https://raw.github.com/uzikilon/backbone-poller/master/backbone.poller.js>)    4.5kb, Uncompressed with Comments
- [Production Version](<https://raw.github.com/uzikilon/backbone-poller/master/backbone.poller.min.js>)   1.32kb, Minified and Gzipped


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

### Advanced Options:
``` javascript
var options = {
    // default delay is 1000ms
    delay: 3000, 
    // condition for keeping polling active (when this stops being true, polling will stop)
    condition: function(model){
        return model.get('active') === true;
    },
    // callback to execute when the condition function is not true anymore, or when calling stop()
    complete: function(model) { 
        console.info('hurray! we are done!'); 
    },
    // callback to execute on every successful fetch
    success: function(model){ 
        console.info('another successful fetch!'); 
    },
    // callback to execute on fetch error
    error: function(model){ 
        console.error('oops! something went wrong'); 
    },
    // data to be passed to a collection fetch request
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
poller.start()

// to stop
poller.stop();

// or make the conditional function return false
model.set('active', false);

// check if poller is running
if (poller.active()) {
// ...
}

// alter options
poller = Backbone.Poller.get(model_or_collection, [other_options]).start();
// or
poller.set([other_options]).start();

```