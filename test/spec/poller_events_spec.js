/* global sinon, Backbone, _*/
describe('Handle events', function () {
  'use strict';

  beforeEach(function () {
    this.model = new Backbone.Model();
    this.collection = new Backbone.Collection();

    this.model.sync = this.collection.sync = function (a, b, c) {
      c.success();
      this.trigger('sync');
    };

    this.mPoller = Backbone.Poller.get(this.model, {delay: 16});
    this.cPoller = Backbone.Poller.get(this.collection, {delay: 16});
  });

  afterEach(function () {
    Backbone.Poller.reset();
  });

  it('Should fire a start event once', function (done) {
    var startSpy = jasmine.createSpy('start');
    this.cPoller.on('start', startSpy);
    this.cPoller.set({delay: 10}).start();
    setTimeout(function () {
      expect(startSpy.calls.count()).toBe(1);
      done();
    }, 100);
  });

  it('Should fire a stop event', function (done) {
    var stopSpy = sinon.spy();
    this.cPoller.on('stop', stopSpy).start().stop();

    var self = this;
    setTimeout(function () {
      expect(self.cPoller.active()).toBe(false);
      done();
    }, 16);
  });

  it('Should fire a fetch event before fetchig', function (done) {
    var pFetchSpy = sinon.spy();
    var mFetchSpy = sinon.spy(this.model, 'fetch');

    this.mPoller.on('fetch', pFetchSpy);
    this.mPoller.start();

    setTimeout(function () {
      expect(pFetchSpy.calledBefore(mFetchSpy)).toEqual(true);
      done();
    }, 17);
  });

  it('Should fire a fetch event before success', function (done) {
    var fetchSpy = sinon.spy();
    var successSpy = sinon.spy();

    this.mPoller.on('fetch', fetchSpy);
    this.mPoller.on('success', successSpy);
    this.mPoller.start();

    setTimeout(function () {
      expect(fetchSpy.calledBefore(successSpy)).toEqual(true);
      done();
    }, 17);
  });

  it('Should fire a fetch event before error', function (done) {
    this.model.sync = function (method, model, options) {
      options.error('ERROR');
    };

    var fetchSpy = sinon.spy();
    var errorSpy = sinon.spy();

    this.mPoller.on('fetch', fetchSpy);
    this.mPoller.on('error', errorSpy);
    this.mPoller.start();

    setTimeout(function () {
      expect(fetchSpy.calledBefore(errorSpy)).toEqual(true);
      done();
    }, 17);
  });

  it('Should fire a success event after each successfull fetch', function (done) {
    var spy = sinon.spy();

    this.mPoller.on('success', spy);
    this.mPoller.start();

    setTimeout(function () {
      expect(spy.callCount).toEqual(3);
      done();
    }, 40);
  });

  it('Should pass backbone arguments into success and error callbacks', function (done) {
    var successSpy = sinon.spy();
    var errorSpy = sinon.spy();

    var model = this.model;
    var dummyResp = {poller: 'is awesome'};
    spyOn(this.model, 'fetch').and.callFake(function (options) {
      options.success(model, dummyResp);
      options.error(model, dummyResp);
    });

    this.mPoller.on('success', successSpy);
    this.mPoller.on('error', errorSpy);
    this.mPoller.start();

    var self = this;
    setTimeout(function () {
      expect(successSpy.calledWith(self.mPoller.model, dummyResp)).toBe(true);
      expect(errorSpy.calledWith(self.mPoller.model, dummyResp)).toBe(true);
      done();
    }, 17);
  });

  it('Should fire a complete event when condition is satisfied', function (done) {
    var bool = true,
        spy = sinon.spy();

    this.mPoller.set({delay: 16, condition: function () { return bool; }});
    this.mPoller.on('complete', spy);
    this.mPoller.start();

    bool = false;

    var self = this;
    setTimeout(function () {
      expect(self.mPoller.active()).toBe(false);
      expect(spy.calledOnce).toBe(true);
      done();
    }, 50);
  });

  it('Should fire an error event when fetch fails', function (done) {
    this.model.sync = function (method, model, options) {
      options.error('ERROR');
    };

    var spy = sinon.spy();
    var poller = this.mPoller.on('error', spy);

    poller.start();

    setTimeout(function () {
      expect(poller.active()).toBe(false);
      done();
    }, 17);
  });

  it('Should keep all events when re-setting options', function (done) {
    this.mPoller.on('foo', function () {});
    this.mPoller.on('bar', function () {});
    this.mPoller.on('baz', function () {});

    /* eslint no-underscore-dangle: 0 */
    var calls = this.mPoller._events || {};
    expect(_(calls).size()).toBe(3);

    this.mPoller.set({foo: 'bar'});

    var self = this;
    setTimeout(function () {
      expect(_(self.mPoller._events || {}).size()).toBe(3);
      done();
    }, 16);
  });

  it('Should rebind when re-setting options', function (done) {
    var spy = sinon.spy();

    this.mPoller.set({success: spy});
    this.mPoller.set({success: spy});

    this.mPoller.start();

    setTimeout(function () {
      expect(spy.calledOnce).toBe(true);
      done();
    }, 17);
  });

  it('shold stop when stopping on a callback', function (done) {
    spyOn(this.model, 'fetch').and.callThrough();
    this.mPoller.on('success', function () {
      this.mPoller.stop();
    }, this);

    this.mPoller.start();

    var self = this;
    setTimeout(function () {
      expect(self.model.fetch.calls.count()).toBe(1);
      expect(self.mPoller.active()).toBe(false);
      done();
    }, 17);
  });
});
