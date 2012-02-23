Backbone Poller
----------
Backbone poller is an simple utility that allows polling on any Backbone model or collection.

While some browsers servers support long polling (comet) and Web Sockets, for basic operations such as checking for new messages in a mailbox,
In many cases it is sufficient to run a standard http request every few seconds to keep the client synced with the server.

* Backbone poller allows you to poll without extending you base backbone models or collections
* Backbone poller is 100% compliant with any Backbone model or collection.

Basic Usage:
-------
``` javascript
var poller = new Poller(model_or_collection);
poller.start();
poller.stop();
```

Advanced Options:
-------
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
var poller = new Poller(model_or_collection, options);

// to stop (and run the complete callback):
this.stop();
// or
model.set('active', false);
```