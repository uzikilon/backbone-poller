describe("Accepting options and invoking in time", function(){
  Backbone.sync = function(method, model, options){
    options.success();
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

  it("Should run the 'fetch' option before each fetch", function() {
    var pFetchSpy = sinon.spy();
    var mFetchSpy = sinon.spy(this.model, 'fetch');
    
    this.mPoller.set({fetch: pFetchSpy, delay: 50});
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
    
    this.mPoller.set({fetch: spy, delay: 50});
    this.mPoller.start();

    waitsFor(function(){
      return spy.callCount === 3;
    });

    runs(function () {
      expect(spy.callCount).toEqual(3);
    });

  });


  it("Should run the 'complete' option when condition is satisfied", function() {
    var bool = true,
        spy = sinon.spy();

    this.mPoller.set({ delay: 50, complete: spy, condition: function(model){ return bool; } }).start();

    bool = false;
    waits(50);

    runs(function(){
      expect(this.mPoller.active()).toBe(false);
      expect(spy.calledOnce).toBe(true);
    });

  });

  it("Should run the 'error' option when fetch fails", function() {
      
    this.model.sync = function(method, model, options){
      options.error("ERROR");
    };

    var spy = sinon.spy();
    var poller = this.mPoller.set({error: spy}).start();

    waitsFor(function(){
      return spy.calledOnce;
    });

    runs(function(){
      expect(poller.active()).toBe(false);
    });

  });

});

