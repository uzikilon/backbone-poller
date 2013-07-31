describe("Accept options and invoking in time", function(){
  var _sync = function(method, model, options){
    options.success(model.toJSON());
  };

  beforeEach(function() {
    this.model = new Backbone.Model();
    this.collection = new Backbone.Collection();
    this.model.sync = this.collection.sync = _sync;

    this.mPoller = Backbone.Poller.get(this.model, {delay: 40});
    this.cPoller = Backbone.Poller.get(this.collection, {delay: 40});
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

  it("Should pass original options to fetch", function () {
    var cFetchSpy = sinon.spy(this.collection, 'fetch');

    this.cPoller.set({update : true});
    this.cPoller.start();

    waitsFor(function(){
      return cFetchSpy.callCount == 1;
    });

    runs(function () {
       expect(cFetchSpy.getCall(0).args[0].update).toBe(true);
    });

  });

  it('Should flush all events when passing flush options', function(){
    this.mPoller.on('backbone', function(){});
    this.mPoller.on('poller', function(){});

    var calls = this.mPoller._callbacks || {};
    expect(_(calls).size()).toBe(2);

    this.mPoller.set({flush: true});

    runs(function(){
      var calls = this.mPoller._callbacks || {};
      expect(_(calls).size()).toBe(0);
    });
  });

  it("Should pass the 'data' option to the fetch call", function() {
    var cFetchSpy = sinon.spy(this.collection, 'fetch');
    var data = {
      a: Math.random(),
      b: Math.random()
    };

    this.cPoller.set({delay: 50, data: data});
    this.cPoller.start();

    waitsFor(function(){
      return cFetchSpy.callCount === 3;
    });

    runs(function () {
      _.each(_.range(3), function (i) {
        var calledWith = cFetchSpy.getCall(i).args[0];

        expect(calledWith.data.a).toEqual(data.a);
        expect(calledWith.data.b).toEqual(data.b);
        expect(calledWith.data.c).toEqual(data.c);
      });
    });

  });

});

