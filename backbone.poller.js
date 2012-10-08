// (c) 2012 Uzi Kilon, Splunk Inc.
// Backbone Poller 0.2
// https://github.com/uzikilon/backbone-poller
// Backbone Poller may be freely distributed under the MIT license.

Backbone.Poller = (function(_, Backbone){

  "use strict";

  var defaults = {
    delay: 1000,
    condition: function(){return true;}
  };
  var eventTypes = ['start', 'stop', 'success', 'error', 'complete', 'fetch'];

  function Poller (model, options) {
    this.model = model;
    this.set(options);
  }

  _.extend(Poller.prototype, Backbone.Events, {
    set: function(options) {
      this.off();
      this.options = _.extend({}, defaults, options || {});
      _.each(eventTypes, function(name){
        var callback = this.options[name];
        _.isFunction(callback) && this.on(name, callback, this);
      }, this);

      if ( this.model instanceof Backbone.Model ) {
        this.model.on('destroy', this.stop, this);
      }

      return this.stop({silent: true});
    },
    start: function(options){
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
          poller.trigger('complete', poller.model);
          poller.stop({silent: true});
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

  var PollingManager = {
    find: function(model) {
      return _.find(pollers, function(poller){
        return poller.model === model;
      });
    },
    get: function(model, options) {
      var poller = this.find(model);
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
      warn('getPoller() is depreacted, Use Backbone.Poller.get()');
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

  function warn() {
    console && console.warn.apply(console, arguments);
  }

  // Expose AMD
  if ( typeof define === "function" && define.amd ) {
    define( function () { return PollingManager; } );
  }
  
  // Depracted: BC, exposing PollingManager on the global scope.
  // Please use Backbone.Poller or AMD instead
  window.PollingManager = PollingManager;

  return PollingManager;

}(_, Backbone));