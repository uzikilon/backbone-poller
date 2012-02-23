Backbone Poller
----------
Backpone poller is an simple utility that allows polling on any bacbone model or collection

Collection Usage:
-------
``` javascript
var condition = function(collection) {
    return true; // poll forever
};

var options = {
    delay: 3000,
    data: {fields: "*", sort: "name desc"}
}

var poller = new Splunk.helpers.model.Poller(colection, condition, options);
poller.start();
```


Model Usage:
-------
``` javascript
var condition = function(model) {
    return model.get('isActive') === true;
};

var options = {
    delay: 3000,
    complete: function() { 
        console.info('hurray!')
    },
    success: function(){ 
        console.info('anopther successful fetch!');
    }, 
    error: function(){ 
        console.error('something went wrong');
    },
}

var poller = new Splunk.helpers.model.Poller(model, condition, options);
poller.start();
```
