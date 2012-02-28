// (c) 2012 Uzi Kilon, Splunk Inc.
// Backbone Poller may be freely distributed under the MIT license.

(function(ns, _){
    
    // constants
    var DEFAULT_DELAY = 1000;
    
    /**
     * Registered models state
     * @deprecated
     */
    var Models = {
        models: {},
        activate: function(model, active){
            this.models[model.cid] = active;
        },
        active: function(model){
            return this.models[model.cid] === true;
        }
    };
    
    /**
     * Poller
     */
    var Poller = function Poller(model, options) {
        this.initialize(model, options);
    }
    _.extend(Poller.prototype, {
        initialize: function(model, options) {
            this.model = model;
            
            this.options = options;
            this.condition = this.options.condition || function(){return true};
            this.delay = this.options.delay || DEFAULT_DELAY;
            
            if ( this.model instanceof Backbone.Model ) {
                this.model.on('destroy', this.stop, this);
            }
            
            this.stop(); // register and set running state to false
            return this;
        },
        start: function(){
            Models.activate(this.model, true); // set running state to true
            run(this);
            return this;
        },
        stop: function(){
            Models.activate(this.model, false); // set running state to false
            return this;
        },
        active: function(){
            return Models.active(this.model);
        }
    });
    
    // private methods
    function run(poller) {
        if ( poller.active() !== true ) {
            return ;
        }
        poller.model.fetch({
            success: function() {
                defer(poller.options.success);
                if(poller.condition(poller.model) !== true) {
                    defer(poller.options.complete);
                    poller.stop(); // set running state to false
                }
                else {
                    setTimeout(function(){ run(poller); }, poller.delay);
                }
            },
            error: function(){
                defer(poller.options.error);
                poller.stop(); // set running state to false
            },
            data: poller.options.data || {}
        });
    }
    // run callback asynchronously
    function defer(func) {
        if(typeof func === 'function') {
            _.defer(func);
        }
    }
    
    /**
     * Polling Manager
     */
    var PollingManager = {
        pollers: {},
        poll: function(model, options) {
            var poller;
            if(typeof this.pollers[model.cid] !== 'undefined') {
                // we have an instance;
                poller = this.pollers[model.cid];
                poller.initialize(model, options);
            }
            else {
                poller = this.pollers[model.cid] = new Poller(model, options);
            }
            return poller.start();
        },
        stop: function(model) {
            var poller = this.pollers[model.cid];
            if(typeof pollers[model.cid] !== 'undefined') {
                poller.stop();
                return true;
            }
            return false;
        }
    }
    /**
     * @deprecated
     */
    ns.Poller = Poller;
    
    ns.PollingManager = PollingManager;
    
}(this, _));