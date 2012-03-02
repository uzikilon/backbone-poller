// (c) 2012 Uzi Kilon, Splunk Inc.
// Backbone Poller may be freely distributed under the MIT license.

!function(ns, _, Backbone){
    
    "use strict";
    
    // constants
    var DEFAULT_DELAY = 1000;
    var DEFAULT_CONDITION = function() {
        return true; 
    };
    
    /**
     * Poller
     */
    var Poller = function Poller(model, options) {
        this.set(model, options);
    };
    _.extend(Poller.prototype, {
        set: function(model, options) {
            
            this.model = model;
            this.options = _.clone(options || {});
            this.condition = this.options.condition || DEFAULT_CONDITION;
            this.delay = this.options.delay || DEFAULT_DELAY;
            
            if ( this.model instanceof Backbone.Model ) {
                this.model.on('destroy', this.stop, this);
            }
            
            return this.stop();
        },
        start: function(){
            if(this.active() === true) {
                return ;
            }
            this.options.active = true;
            run(this);
            return this;
        },
        stop: function(){
            this.options.active = false;
            if(this.xhr && typeof this.xhr.abort === 'function') {
                this.xhr.abort();
            }
            this.xhr = null;
            return this;
        },
        active: function(){
            return this.options.active === true;
        }
    });
    
    // private methods
    function run(poller) {
        if ( poller.active() !== true ) {
            window.clearTimeout(poller.timeoutId);
            return ;
        }
        poller.xhr = poller.model.fetch({
            success: function() {
                defer(poller.options.success);
                if( poller.condition(poller.model) !== true ) {
                    defer(poller.options.complete);
                    poller.stop();
                }
                else {
                    poller.timeoutId = window.setTimeout(function(){ run(poller); }, poller.delay);
                }
            },
            error: function(){
                defer(poller.options.error);
                poller.stop();
            },
            data: poller.options.data || {}
        });
    }
    // run callback asynchronously
    function defer(func) {
        if( typeof func === 'function' ) {
            _.defer(func);
        }
    }
    
    /**
     * Polling Manager
     */
    var pollers = [];
    
    var PollingManager = {
        get: function(model) {
            return _.find(pollers, function(poller){ 
                return poller.model === model;
            });
        },
        poll: function(model, options) {
            var poller = this.get(model);
            if( poller ) {
                poller.set(model, options);
            }
            else {
                poller = new Poller(model, options);
                pollers.push(poller);
            }
            return poller.start();
        },
        stop: function(model) {
            var poller = this.get(model);
            if( poller ) {
                poller.stop();
                return true;
            }
            return false;
        },
        size: function(){
            return pollers.length;
        }
    };
    
    ns.PollingManager = PollingManager;
    
}(this, window._, window.Backbone);