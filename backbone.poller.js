(function(ns, _){
    
    var Models = {
        models: {},
        activate: function(model, active){
            this.models[model.cid] = active;
        },
        registered: function(model){
            return typeof this.models[model.cid] !== 'undefined'; 
        },
        active: function(model){
            return this.registered(model) && this.models[model.cid] === true;
        }
    };
    
    // constants
    var DEFAULT_DELAY = 1000;
    
    // private members
    var _model, _condition, _options, _delay;
    
    var Poller = function Poller(model, condition, options) {
        if( Models.registered(model) ) {
            throw 'can ony run one poller instance per model'; 
        }
        
        _model = model;
        _condition = condition;
        _options = options || {};
        _delay = _options.delay || DEFAULT_DELAY;
        
        this.stop(); // register and set running state to false
        
        if ( _model instanceof Backbone.Model ) {
            _model.on('destroy', this.stop, this);
        }
    }
    _.extend(Poller.prototype, {
        start: function(){
            if(this.active()) {
                throw 'can only start a poller once';
            }
            Models.activate(_model, true); // set running state to true
            run(this);
            return this;
        },
        stop: function(){
            Models.activate(_model, false); // set running state to false
            return this;
        },
        active: function(){
            return Models.active(_model);
        }
    });
    
    // private methods
    function run(poller) {
        if ( (poller.active() !== true) || (_condition(_model) !== true) ) {
            defer(_options.complete);
            poller.stop(); // set running state to false
            return ; 
        }
        _model.fetch({
            success: function() {
                defer(_options.success);
                setTimeout(function(){ run(poller); }, _delay);
            },
            error: function(){
                defer(_options.error);
                poller.stop(); // set running state to false
            },
            data: _options.data || {}
        });
    }
    // run callbacks asynchronously
    function defer(func) {
        if(typeof func === 'function') {
            _.defer(func);
        }
    }
    
    ns.Poller = Poller;
    
}(this, _));