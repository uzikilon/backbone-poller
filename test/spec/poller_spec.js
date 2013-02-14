describe("Base poller operations", function() {

  function hasManagerAPI(manager){
    var method, api = ['get', 'size', 'reset'];
    while(method = api.shift()) {
      expect(manager[method]).toEqual(jasmine.any(Function));
    }
  }

  describe('Poller funcionality', function() {
    var _sync = function(method, model, options){
      options.success(model.toJSON());
      return _.clone(jQuery.ajax());
    };

    beforeEach(function() {
      this.model = new Backbone.Model();
      this.collection = new Backbone.Collection();
      this.model.sync = this.collection.sync = _sync;

      this.mPoller = Backbone.Poller.get(this.model, {delay: 50});
      this.cPoller = Backbone.Poller.get(this.collection, {delay: 50});
    });

    afterEach(function(){
      this.model.destroy();
      this.collection.reset();

      delete this.model;
      delete this.collection;

      Backbone.Poller.reset();
    });


    function hasPollerAPI(poller){
      var method, api = ['set', 'active', 'start', 'stop'];
      while(method = api.shift()) {
        expect(poller[method]).toEqual(jasmine.any(Function));
      }
    }

    it('Should not have legacy support for PollingManager global object', function(){
      expect(window.PollingManager).toBeUndefined();
    });

    it('Should have all supported methods on API', function(){
      hasManagerAPI(Backbone.Poller);
      hasPollerAPI(this.mPoller);
      hasPollerAPI(this.cPoller);
    });

    it('Should delete all polllers when calling reset()', function(){
      expect(Backbone.Poller.size()).toEqual(2);

      this.mPoller.start();
      expect(this.mPoller.active()).toEqual(true);

      Backbone.Poller.reset();
      expect(this.mPoller.active()).toEqual(false);

      expect(Backbone.Poller.size()).toEqual(0);
    });


    it("Should create one instance per model", function() {
      expect(Backbone.Poller.size()).toEqual(2);

      var mPoller1 = Backbone.Poller.get(this.model);
      var mPoller2 = Backbone.Poller.get(this.model);
      var mPoller3 = Backbone.Poller.get(this.model);

      expect(Backbone.Poller.size()).toEqual(2);

      var newModel = new Backbone.Model();

      var mPoller4 = Backbone.Poller.get(newModel);
      expect(Backbone.Poller.size()).toEqual(3);

      var mPoller5 = Backbone.Poller.get(newModel);
      expect(Backbone.Poller.size()).toEqual(3);
    });

    it("Should start when invoking start()", function() {
      spyOn(this.model, 'fetch');
      expect(this.mPoller.active()).toBe(false);
      this.mPoller.start();
      expect(this.mPoller.active()).toBe(true);
      expect(this.model.fetch).toHaveBeenCalled();
    });

    it("Should stop when invoking stop()", function() {
      this.mPoller.start();

      expect(this.mPoller.active()).toBe(true);
      this.mPoller.stop();

      expect(this.mPoller.active()).toBe(false);
    });

    it("Should abort XHR (only once) when invoking stop()", function() {

      expect(this.mPoller.xhr).toBeNull();

      this.mPoller.start();

      expect(this.mPoller.xhr).not.toBeNull();
      spyOn(this.mPoller.xhr, 'abort').andCallThrough();

      var spy = this.mPoller.xhr.abort;
      expect(spy.callCount).toEqual(0);

      this.mPoller.stop();
      expect(spy.callCount).toEqual(1);
      expect(this.mPoller.xhr).toBeNull();

      this.mPoller.stop();
      expect(spy.callCount).toEqual(1);
    });

    it("Should stop when condition is satisfied", function() {
      var bool = true,
      options = { delay: 50, condition: function(model){ return bool; } },
      poller = Backbone.Poller.get(this.model, options).start();

      expect(poller.active()).toBe(true);

      bool = false;
      waits(50);

      runs(function(){
        expect(poller.active()).toBe(false);
      });

    });

    it("Should fetch more than once when polling a model", function() {
      var counter = 1;
      var flag = false;

      spyOn(this.model, "fetch").andCallThrough();
      var spy = this.model.fetch;

      this.mPoller.start();

      this.mPoller.on('success', function(){
        flag = (++counter == 4);
      });

      waitsFor(function(){
        return flag;
      });

      runs(function(){
        expect(this.mPoller.active()).toBe(true);
      });


    });

    it("Should fetch more than once when polling a collection", function() {
      var counter = 1;
      var flag = false;

      spyOn(this.collection, "fetch").andCallThrough();
      var spy = this.model.collection;

      this.cPoller.on('success', function(){
        flag = (++counter == 4);
      });
      this.cPoller.start();

      waitsFor(function(){
        return flag;
      });

      runs(function () {
        expect(this.cPoller.active()).toBe(true);
      });

    });

    it("Sould have a reset the poller's xhr and timeoutId when stopped", function(){
      var poller = this.mPoller;

      expect(poller.active()).toBe(false);
      expect(poller.xhr).toBeNull();
      expect(poller.timeoutId).toBeNull();

      poller.start();

      expect(poller.active()).toBe(true);
      expect(poller.xhr).not.toBeNull();
      expect(poller.timeoutId).toEqual(jasmine.any(Number));

      poller.stop();

      expect(poller.active()).toBe(false);
      expect(poller.xhr).toBeNull();
      expect(poller.timeoutId).toBeNull();

    });


    it("Should stop when model is destroyed", function() {
      spyOn(this.model, "destroy").andCallThrough();
      var spy = this.model.destroy;
      var flag = false;
      this.model.on('destroy', function(){ flag = true; });

      this.mPoller.start();

      expect(spy.callCount).toBe(0);

      this.model.destroy();

      waitsFor(function(){ return flag; });

      runs(function () {
        expect(spy.callCount).toBe(1);
        expect(this.mPoller.active()).toBe(false);
      });
    });
  });

  describe('AMD support', function() {

    window.require = {
      paths: {
        underscore: 'lib/underscore',
        jquery: 'lib/jquery-1.8.2',
        backbone: 'lib/backbone'
      },
      shim: {
        underscore: {
          exports: '_'
        },
        backbone: {
          deps: ['underscore', 'jquery'],
          exports: 'Backbone'
        }
      }
    };

    beforeEach(function () {

      var self = this;
      var hasRequireJS = false;

      runs(function () {
        var node = document.createElement('script');
        node.type = 'text/javascript';
        node.charset = 'utf-8';
        node.async = 'true';
        if ( node.attachEvent ) {
          node.attachEvent('onreadystatechange', function() { hasRequireJS = true; });
        }
        else {
          node.addEventListener('load', function () { hasRequireJS = true; }, false);
        }
        node.src = 'lib/require.js';
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(node);
      });


      waitsFor(function () {
        return hasRequireJS;
      });

      runs(function() {
        require(['../backbone.poller'], function (Poller) {
          self.Poller = Poller;
        });
      });

      waitsFor(function () {
        return !!self.Poller;
      });


    });

    afterEach(function () {
      // give Poller back to window to avoid breaking the environment
      // this is dirty but having a AMD env with a non-AMD env gets tricky
      window.Backbone.Poller = this.Poller;
    });


    it('should load as an AMD module', function() {
      var self = this;
      runs(function () {
        hasManagerAPI(self.Poller);
      });

    });



  });

});