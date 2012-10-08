// (c) 2012 Uzi Kilon, Splunk Inc.
// Backbone Poller 0.1
// https://github.com/uzikilon/backbone-poller
// Backbone Poller may be freely distributed under the MIT license.

!function(ns, _, Backbone){

  "use strict";

  var defaults = {
    delay: 1000,
    condition: function(){return true;}
  };
  var eventTypes = ['start', 'stop', 'success', 'error', 'complete', 'fetch'];

    /**
     * Poller
     */
     var Poller = function Poller(model, options) {
      this.model = model;
      this.set(options);
    };
    _.extend(Poller.prototype, Backbone.Events, {
      set: function(options) {
        this.off();
        this.options = _.extend({}, defaults, options || {});

        _.each(eventTypes, function(eventName){
          var handler = this.options[eventName];
          _.isFunction(handler) && this.on(eventName, handler, this);
        }, this);

        if ( this.model instanceof Backbone.Model ) {
          this.model.on('destroy', this.stop, this);
        }

        return this.stop({silent: true});
      },
      start: function(options){
        if(this.active() === true) {
          return this;
        }
        options = options || {};
        if( !options.silent ) {
          this.trigger('start', this.model);
        }
        this.options.active = true;
        run(this);
        return this;
      },
      stop: function(options){
        options = options || {};
        if( !options.silent ) {
          this.trigger('stop', this.model);
        }
        this.options.active = false;
        this.xhr && _.isFunction(this.xhr.abort) && this.xhr.abort();
        this.xhr = null;
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
        return this;
      },
      active: function(){
        return this.options.active === true;
      }
    });

    // private methods
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

    /**
     * Polling Manager
     */
     var pollers = [];

     Backbone.Poller = {
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
        console && console.warn('getPoller() is depreacted, Use Backbone.Poller.get()');
        return this.get.apply(this, arguments);
      },
      size: function(){
        return pollers.length;
      },
      reset: function(){
        _.each(pollers, function(poller, key){
          poller.stop();
          delete pollers[key];
        });
      }
    };
    
    // Deprecated: Use Backbone.Poller
    ns.PollingManager = Backbone.Poller;
    
  }(this, this._, this.Backbone);