describe("Accept options and invoking in time", function(){
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

    Backbone.Poller.reset();
  });

  it('Should respect the options passed to Backbone.Poller.get()', function(){
    var poller, options;
    options = {delay: 1, foo: 'bar'};
    poller = Backbone.Poller.get(new Backbone.Model(), options);
    expect(poller.options.delay).toEqual(1);
    expect(poller.options.foo).toEqual('bar');

    options = {delay: 2, foo: 'baz'};
    poller = Backbone.Poller.get(new Backbone.Model(), options);
    expect(poller.options.delay).toEqual(2);
    expect(poller.options.foo).toEqual('baz');

  });

  it('Should respect the options passed to poller.set()', function(){
    var options;
    options = {delay: 1, foo: 'bar'};
    this.mPoller.set(options);
    expect(this.mPoller.options.delay).toEqual(1);
    expect(this.mPoller.options.foo).toEqual('bar');

    options = {delay: 2, foo: 'baz'};
    this.mPoller.set(options);
    expect(this.mPoller.options.delay).toEqual(2);
    expect(this.mPoller.options.foo).toEqual('baz');
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

  it("Should pass the 'data' option to the fetch call", function() {
    var mFetchSpy = sinon.spy(this.model, 'fetch');
    var data = {
      url: "foo",
      success: "this will be overwritten",
      error: "this will be overwritten"
    };
    
    this.mPoller.set({delay: 50, data: data});
    this.mPoller.start();

    waitsFor(function(){
      return mFetchSpy.callCount === 3;
    });

    runs(function () {
      _.each([0, 1, 2], function (i) {
        var calledWith = mFetchSpy.getCall(i).args[0];
        expect(calledWith.url).toEqual(data.url);
        expect(calledWith.success).not.toEqual(data.success);
        expect(calledWith.error).not.toEqual(data.success);
      });
    });

  });

});

