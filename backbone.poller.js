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
            
            this.stop(); // register and set running state to false
            return this;
        },
        start: function(){
            this.options.active = true;
            return this;
        },
        stop: function(){
            this.options.active = false;
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
                    window.setTimeout(function(){ run(poller); }, poller.delay);
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
    var PollingManager = {
        pollers: {},
        poll: function(model, options) {
            var poller = this.pollers[model];
            if( typeof poller !== 'undefined' && poller.model === model ) {
                poller.set(model, options);
            }
            else {
                poller = this.pollers[model] = new Poller(model, options);
            }
            return poller.start();
        },
        stop: function(model) {
            var poller = this.pollers[model];
            if( typeof poller !== 'undefined' && poller.model === model ) {
                poller.stop();
                return true;
            }
            return false;
        }
    };
    
    ns.PollingManager = PollingManager;
    
}(this, window._, window.Backbone);