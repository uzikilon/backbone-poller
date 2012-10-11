// <pre>
// (c) 2012 Uzi Kilon, Splunk Inc.
// Backbone Poller 0.2
// https://github.com/uzikilon/backbone-poller
// Backbone Poller may be freely distributed under the MIT license.
// See <a href='http://uzikilon.github.com/backbone-poller/test/SpecRunner.html'>test suite</a>
// </pre>

Backbone.Poller = (function(_, Backbone){

  "use strict";

  var defaults = {
    delay: 1000,
    condition: function(){return true;}
  };

  var events = ['start', 'stop', 'fetch', 'success', 'error', 'complete' ];

  // **Poller constructor**
  // ***new Poller(model[, options])***
  // <pre>
  // Returns a new poller instance
  // This private method is called via Backbone.Poller.get()
  // </pre>
  function Poller(model, options) {
    this.model = model;
    this.set(options);
  }

  _.extend(Poller.prototype, Backbone.Events, {
    
    // **poller.set([options])**
    // <pre>
    // Reset poller options and stops the poller
    // </pre>
    set: function(options) {
      this.off();
      this.options = _.extend({}, defaults, options || {});
      _.each(events, function(name){
        var callback = this.options[name];
        _.isFunction(callback) && this.on(name, callback, this);
      }, this);

      if ( this.model instanceof Backbone.Model ) {
        this.model.on('destroy', this.stop, this);
      }

      return this.stop({silent: true});
    },
    // 
    // **poller.start([options])**
    // <pre>
    // Start the poller
    // Returns a poller instance
    // Triggers a 'start' events unless options.silent is set to true
    // </pre>
    start: function(options) {
      if( ! this.active() ) {
        options = options || {};
        if( !options.silent ) {
          this.trigger('start', this.model);
        }
        this.options.active = true;
        run(this);
      }
      return this;
    },
    // **poller.stop([options])**
    // <pre>
    // Stops the poller
    // Returns a poller instance
    // Triggers a 'stop' events unless options.silent is set to true
    // </pre>
    stop: function(options){
      options = options || {};
      if( !options.silent ) {
        this.trigger('stop', this.model);
      }
      this.options.active = false;
      this.xhr && this.xhr.abort && this.xhr.abort();
      this.xhr = null;
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      return this;
    },
    // **poller.active()**
    // <pre>
    // Retunrs a bollean for poller status
    // </pre>
    active: function(){
      return this.options.active === true;
    }
  });

  function run(poller) {
    if ( poller.active() !== true ) {
      poller.stop({silent: true});
      return ;
    }
    var options = _.extend({}, poller.options, {
      success: function() {
        poller.trigger('success', poller.model);
        if( poller.options.condition(poller.model) !== true ) {
          poller.stop({silent: true});
          poller.trigger('complete', poller.model);
        }
        else {
          poller.timeoutId = _.delay(run, poller.options.delay, poller);
        }
      },
      error: function(){
        poller.stop({silent: true});
        poller.trigger('error', poller.model);
      }
    });
    poller.trigger('fetch', poller.model);
    poller.xhr = poller.model.fetch(options);
  }

  var pollers = [];
  function findPoller(model){
    return _.find(pollers, function(poller){
        return poller.model === model;
      });
  }

  var PollingManager = {
    // **Backbone.Poller.get(model[, options])**
    // <pre>
    // Retuns a singleton instance of a poller for a model
    // Stops it if running
    // If options.autostart is true, will start it
    // Retuns a poller isntance
    // </pre>
    get: function(model, options) {
      var poller = findPoller(model);
      if( ! poller ) {
        poller = new Poller(model, options);
        pollers.push(poller);
      }
      else {
        poller.set(options);
      }
      if( options && options.autostart === true ) {
        poller.start({silent: true});
      }
      return poller;
    },
    // Deprecated: Use Backbone.Poller.get()
    getPoller: function() {
      console && console.warn('getPoller() is depreacted, Use Backbone.Poller.get()');
      return this.get.apply(this, arguments);
    },
    size: function(){
      return pollers.length;
    },
    reset: function(){
      var poller;
      while( poller = pollers.pop() ) {
        poller.stop();
      }
    }
  };
  
  // Depracted: BC, exposing PollingManager on the global scope.
  // Please use Backbone.Poller or AMD instead
  window.PollingManager = PollingManager;

  return PollingManager;

}(_, Backbone));