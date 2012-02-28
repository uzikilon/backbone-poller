# Backbone Poller
Backbone poller is an simple utility that allows polling on any Backbone model or collection.

Some modern browsers and servers support Web Sockets oe long polling (comet) and allow advanced polling models update options.
Hoever, in many cases it is sufficient to run a standard http request every few seconds to keep the client synced with the server.
for instance, basic operations such as checking for new messages in a mailbox.

Backbone poller helps with these cases:

- Allows you to poll without extending you base backbone models or collections
- Is 100% compliant with any Backbone model or collection.

## Background:
http://kilon.org/blog/2012/02/backbone-poller/

### Basic Usage:
``` javascript
// to initialize:
var poller = PollingManager.poll(model_or_collection);

// to stop:
poller.stop();

```

### Advanced Options:
``` javascript
var options = {
	// defalut delay is 1000ms
    delay: 3000, 
    // condition for keeping polling active (when this stops being true, polling will stop)
    condition: function(model){
        return model.get('active') === true;
    },
    // callback to execute when the condition function is not true anymore, or when calling stop()
    complete: function() { 
        console.info('hurray! we are done!'); 
    },
    // callback to execute on every successfull fetch
    success: function(){ 
        console.info('another successful fetch!'); 
    },
    // callback to execute on fetch error
    error: function(){ 
        console.error('oops! something went wrong'); 
    },
    // data to be passed to a collectoin fetch request
    data: {fields: "*", sort: "name asc"}
}
var poller = PollingManager.poll(model_or_collection, options);

// to stop
poller.stop();
// or
PollingManager.stop(model_or_collection);
// or make the conditinal function return false
model.set('active', false);

// check if poller is running
if (poller.active()) {
// ...
}

// alter options
poller = PollingManager.poll(model_or_collection, [other_options]);
// or
poller.set(model_or_collection, [other_options]);

```