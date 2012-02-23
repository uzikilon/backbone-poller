Backbone Poller
----------
Backbone poller is an simple utility that allows polling on any Backbone model or collection.
While some browsers servers support long polling (comet) and Web Sockets, for basic operations such as checking for new messages in a mailbox,
It can be sufficient to run a standard http request every few seconds to keep the client synced with the server.
Backbone poller allows you to do it without extending you base backbone models or collections and is 100% compliant with any Backbone models or collections.

Collection Usage:
-------
``` javascript
var condition = function(collection) {
    return true; // poll forever
};
// optional options
var options = {
    delay: 3000, // default is 1000 ms
    success: function(){ 
        console.info('successful fetch!');
    }, 
    error: function(){ 
        console.error('oops! something went wrong');
    },
    data: {fields: "*", sort: "name desc"}
}
var poller = new Splunk.helpers.model.Poller(collection, condition, options);
poller.start();

// to stop the poller and run the 'complete' callback
poller.stop();
```


Model Usage:
-------
``` javascript
var condition = function(model) {
    return model.get('isActive') === true; // poll while model is active
};

var options = {
    delay: 3000,
    complete: function() { 
        console.info('hurray! we are done!')
    },
    success: function(){ 
        console.info('another successful fetch!');
    },
    error: function(){ 
        console.error('oops! something went wrong');
    },
}

var poller = new Splunk.helpers.model.Poller(model, condition, options);
poller.start();

// To stop the poller and run the 'complete' callback
poller.stop();

// or when condition is not true anymore
model.set('isActive', false);

```
