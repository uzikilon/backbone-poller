describe("Accepting options and invoking in time", function(){
  Backbone.sync = function(method, model, options){
    options.success();
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

  it("Should run the 'fetch' option before each fetch", function() {
    var pFetchSpy = sinon.spy();
    var mFetchSpy = sinon.spy(this.model, 'fetch');
    
    this.mPoller.set(this.model, {fetch: pFetchSpy, delay: 50});
    this.mPoller.start();

    waitsFor(function(){
      return pFetchSpy.callCount === 3;
    });

    runs(function () {
      expect(pFetchSpy.calledBefore(mFetchSpy)).toEqual(true);
    });

  });

  it("Should run the 'success' option after each successfull fetch", function() {
    var spy = sinon.spy();
    
    this.mPoller.set(this.model, {fetch: spy, delay: 50});
    this.mPoller.start();

    waitsFor(function(){
      return spy.callCount === 3;
    });

    runs(function () {
      expect(spy.callCount).toEqual(3);
    });

  });


  it("Should run the 'complete' option when condition is satisfied", function() {
      
    var counter = 0,
        spy = sinon.spy(),
        options = {
          delay: 50,
          complete: spy,
          condition: function(model){
            return ++counter < 5;
          }
        },
        poller = PollingManager.getPoller(this.model, options).start();

    waitsFor(function(){
      return spy.calledOnce;
    });

    runs(function(){
      expect(poller.active()).toBe(false);
      expect(counter).toEqual(5);
    });

  });

  it("Should run the 'error' option when fetch fails", function() {
      
    this.model.sync = function(method, model, options){
      options.error("ERROR");
    };

    var spy = sinon.spy();
    var poller = this.mPoller.set(this.model, {error: spy}).start();

    waitsFor(function(){
      return spy.calledOnce;
    });

    runs(function(){
      expect(poller.active()).toBe(false);
    });

  });

});

