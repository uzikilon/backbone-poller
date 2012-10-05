describe("Backbone Poller", function() {

  Backbone.sync = function(method, model, options){
    options.success(model.toJSON());
  };

  beforeEach(function() {
    this.model = new Backbone.Model();
    this.collection = new Backbone.Collection();

    this.mPoller = PollingManager.getPoller(this.model, {delay: 50});
    this.cPoller = PollingManager.getPoller(this.collection, {delay: 50});
  });

  afterEach(function(){
    this.model.destroy();
    this.collection.reset();
    
    delete this.model;
    delete this.collection;

    PollingManager.reset();
  });

  it("Should Not override instances", function() {
    expect(PollingManager.size()).toEqual(2);
  });

  it("Should Not create one instance per model", function() {
    var mPoller1 = PollingManager.getPoller(this.model);
    var mPoller2 = PollingManager.getPoller(this.model);
    var mPoller3 = PollingManager.getPoller(this.model);
    expect(PollingManager.size()).toEqual(2);
  });

  it("Should Start", function() {
    var spy = sinon.spy(this.model, "fetch");
    expect(this.mPoller.active()).toBeFalsy();
    this.mPoller.start();
    expect(this.mPoller.active()).toBeTruthy();
    expect(spy.calledOnce).toEqual(true);
  });

  it("Should Stop wehen calling stop()", function() {
    this.mPoller.start();
    expect(this.mPoller.active()).toBeTruthy();
    this.mPoller.stop();
    expect(this.mPoller.active()).toBeFalsy();
  });

  it("Should Fetch More Than Once When Polling a Model", function() {
    var spy = sinon.spy(this.model, "fetch");
    this.mPoller.start();

    waitsFor(function(){
      return spy.calledThrice;
    });

  });

  it("Should Fetch More Than Once When Polling a Collection", function() {
    var spy = sinon.spy(this.collection, "fetch");
    this.cPoller.start();

    waitsFor(function(){
      return spy.calledThrice;
    });

    runs(function () {
      expect(this.cPoller.active()).toBeTruthy();
    });
  });

  it("Should Stop when model is destroyed", function() {
    var spy = sinon.spy();
    this.model.on('destroy', spy);
    this.mPoller.start();
    this.model.destroy();

    waitsFor(function(){
      return spy.calledOnce;
    });

    runs(function () {
      expect(this.cPoller.active()).toBeFalsy();
    });
  });

});