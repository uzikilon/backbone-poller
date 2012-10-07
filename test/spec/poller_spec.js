describe("Base poller operations", function() {

  Backbone.sync = function(method, model, options){
    options.success(model.toJSON());
  };

  beforeEach(function() {
    this.model = new Backbone.Model();
    this.collection = new Backbone.Collection();

    this.mPoller = Backbone.Poller.get(this.model, {delay: 50});
    this.cPoller = Backbone.Poller.get(this.collection, {delay: 50});
  });

  afterEach(function(){
    this.model.destroy();
    this.collection.reset();
    
    delete this.model;
    delete this.collection;

    PollingManager.reset();
  });


  it("Should create one instance per model", function() {
    expect(PollingManager.size()).toEqual(2);
    var mPoller1 = Backbone.Poller.get(this.model);
    var mPoller2 = Backbone.Poller.get(this.model);
    var mPoller3 = Backbone.Poller.get(this.model);
    expect(PollingManager.size()).toEqual(2);
  });

  it("Should start when invoking start()", function() {
    var spy = sinon.spy(this.model, "fetch");
    expect(this.mPoller.active()).toBe(false);
    this.mPoller.start();
    expect(this.mPoller.active()).toBe(true);
    expect(spy.calledOnce).toEqual(true);
  });

  it("Should stop when invoking stop()", function() {
    this.mPoller.start();
    expect(this.mPoller.active()).toBe(true);
    this.mPoller.stop();
    expect(this.mPoller.active()).toBe(false);
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
    var spy = sinon.spy(this.model, "fetch");
    this.mPoller.start();

    waits(160);

    runs(function(){
      expect(spy.callCount).toEqual(4);
      expect(this.mPoller.active()).toBe(true);
    });


  });

  it("Should fetch more than once when polling a collection", function() {
    var spy = sinon.spy(this.collection, "fetch");
    this.cPoller.start();

    waits(160);

    runs(function () {
      expect(spy.callCount).toEqual(4);
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
    var spy = sinon.spy();
    this.model.on('destroy', spy);
    this.mPoller.start();

    expect(this.mPoller.active()).toBe(true);

    this.model.destroy();

    runs(function () {
      expect(this.mPoller.active()).toBe(false);
    });
  });

});