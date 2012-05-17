// (c) 2012 Uzi Kilon, Splunk Inc.
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
        this.set(model, options);
    };
    _.extend(Poller.prototype, Backbone.Events, {
        set: function(model, options) {
            this.model = model;
            this.options = _.extend(_.clone(defaults), options || {});
            
            _.each(eventTypes, function(eventName){
                var handler = this.options[eventName];
                if(typeof handler === 'function') {
                    this.on(eventName, handler, this);
                }
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
            if(!options.silent) {
                this.trigger('start');
            }
            this.options.active = true;
            run(this);
            return this;
        },
        stop: function(options){
            options = options || {};
            if(!options.silent) {
                this.trigger('stop');
            }
            this.options.active = false;
            if(this.xhr && typeof this.xhr.abort === 'function') {
                this.xhr.abort();
            }
            this.xhr = null;
            window.clearTimeout(this.timeoutId);
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
                poller.trigger('success');
                if( poller.options.condition(poller.model) !== true ) {
                    poller.trigger('complete');
                    poller.stop({silent: true});
                }
                else {
                    poller.timeoutId = window.setTimeout(function(){ run(poller); }, poller.options.delay);
                }
            },
            error: function(){
                poller.trigger('error');
                poller.stop({silent: true});
            }
        });
        poller.trigger('fetch');
        poller.xhr = poller.model.fetch(options);
    }
    
    /**
     * Polling Manager
     */
    var pollers = [];
    
    var PollingManager = {
        find: function(model) {
            return _.find(pollers, function(poller){
                return poller.model === model;
            });
        },
        getPoller: function(model, options){
            var poller = this.find(model);
            options = options || {};
            if( poller ) {
                poller.set(model, options);
            }
            else {
                poller = new Poller(model, options);
                pollers.push(poller);
            }
            if(options.autostart === true) {
                poller.start({silent: true});
            }
            return poller;
        },
        size: function(){
            return pollers.length;
        }
    };
    
    ns.PollingManager = PollingManager;
    
}(this, window._, window.Backbone);