/* global jasmine, Backbone, _ */
describe('Base poller operations', function () {
  'use strict';

  function hasManagerAPI(manager) {
    var method, api = ['get', 'size', 'reset'];
    while (!_.isUndefined(method = api.shift())) {
      expect(manager[method]).toEqual(jasmine.any(Function));
    }
  }

  function hasPollerAPI(poller) {
    var method, api = ['set', 'active', 'start', 'stop'];
    while (!_.isUndefined(method = api.shift())) {
      expect(poller[method]).toEqual(jasmine.any(Function));
    }
  }

  function sync(method, model, options) {
    options.success(model.toJSON());
    model.trigger('sync');
    return {
      abort: function () {}
    };
  }

  describe('Poller funcionality', function () {
    /* eslint max-statements: 0 */
    beforeEach(function () {
      this.model = new Backbone.Model();
      this.collection = new Backbone.Collection();
      this.model.sync = this.collection.sync = sync;

      this.mPoller = Backbone.Poller.get(this.model, {delay: 50});
      this.cPoller = Backbone.Poller.get(this.collection, {delay: 50});
    });

    afterEach(function () {
      Backbone.Poller.reset();
    });

    it('Should not have legacy support for PollingManager global object', function () {
      expect(window.PollingManager).toBeUndefined();
    });

    it('Should have all supported methods on API', function () {
      hasManagerAPI(Backbone.Poller);
      hasPollerAPI(this.mPoller);
      hasPollerAPI(this.cPoller);
    });

    it('Should delete all pollers when calling reset()', function () {
      Backbone.Poller.reset();
      expect(Backbone.Poller.size()).toEqual(0);
    });

    it('Should stop all pollers when calling reset()', function () {
      this.mPoller.start();
      this.cPoller.start();
      expect(this.mPoller.active()).toEqual(true);
      expect(this.cPoller.active()).toEqual(true);
      Backbone.Poller.reset();
      expect(this.mPoller.active()).toEqual(false);
      expect(this.cPoller.active()).toEqual(false);
    });

    it('pass through on start when already running', function () {
      this.mPoller.start();
      var spy = jasmine.createSpy();
      this.mPoller.on('start', spy);
      this.mPoller.start();
      expect(spy).not.toHaveBeenCalled();
    });

    it('Should not create more than one instance per model', function () {
      var mPoller1 = Backbone.Poller.get(this.model);
      expect(mPoller1).toBe(this.mPoller);
      expect(Backbone.Poller.size()).toEqual(2);
    });

    it('Should create a unique instnace per model', function () {
      var mPoller = Backbone.Poller.get(new Backbone.Model());

      expect(mPoller).not.toBe(this.mPoller);
      expect(Backbone.Poller.size()).toEqual(3);
    });

    it('Should start when invoking start()', function () {
      spyOn(this.model, 'fetch');
      expect(this.mPoller.active()).toBe(false);
      this.mPoller.start();
      expect(this.mPoller.active()).toBe(true);
      expect(this.model.fetch).toHaveBeenCalled();
    });

    describe('Run delayed', function () {
      beforeEach(function () {
        this.options = {delay: 100, delayed: true};
        spyOn(this.model, 'fetch');
        expect(this.mPoller.active()).toBe(false);
      });

      afterEach(function () {
        this.mPoller.stop();
      });

      it('Should start delayed when invoking start() with a flag', function (done) {
        this.mPoller.set(this.options).start();
        expect(this.mPoller.active()).toBe(true);
        expect(this.model.fetch).not.toHaveBeenCalled();
        setTimeout(function () {
          expect(this.model.fetch).toHaveBeenCalled();
          done();
        }.bind(this), 101);
      });

      it('Shouls not run when condition is falsy on run time', function (done) {
        var doRun = true;
        this.options.condition = function () {
          return doRun;
        };
        this.mPoller.set(this.options).start();
        expect(this.mPoller.active()).toBe(true);
        expect(this.model.fetch).not.toHaveBeenCalled();

        doRun = false;

        setTimeout(function () {
          expect(this.mPoller.active()).toBe(false);
          expect(this.model.fetch).not.toHaveBeenCalled();
          done();
        }.bind(this), 101);
      });

      it('Should not reset delayed flag on start', function () {
        this.mPoller.set(this.options).start();
        expect(this.mPoller.options.delayed).toBe(true);
      });

      it('accepts delayed as a number', function (done) {
        this.mPoller.set({delay: 10, delayed: 50}).start();
        this.model.fetch.and.callThrough();

        setTimeout(function () {
          expect(this.model.fetch).not.toHaveBeenCalled();
          setTimeout(function () {
            expect(this.model.fetch).toHaveBeenCalled();
            expect(this.model.fetch.calls.count()).toBe(1);
            setTimeout(function () {
              expect(this.model.fetch.calls.count()).toBe(2);
              setTimeout(function () {
                expect(this.model.fetch.calls.count()).toBe(3);
                done();
              }.bind(this), 11);
            }.bind(this), 11);
          }.bind(this), 41);
        }.bind(this), 11);
      });
    });

    describe('.destroy', function () {
      it('calls this.stop', function () {
        spyOn(this.mPoller, 'stop').and.callThrough();
        this.mPoller.destroy();
        expect(this.mPoller.stop).toHaveBeenCalled();
      });

      it('calls this.stopListening', function () {
        spyOn(this.mPoller, 'stopListening').and.callThrough();
        this.mPoller.destroy();
        expect(this.mPoller.stopListening).toHaveBeenCalled();
      });

      it('calls this.off', function () {
        spyOn(this.mPoller, 'off').and.callThrough();
        this.mPoller.destroy();
        expect(this.mPoller.off).toHaveBeenCalled();
      });

      it('removes poller from registry', function () {
        expect(Backbone.Poller.size()).toBe(2);
        this.mPoller.destroy();
        expect(Backbone.Poller.size()).toBe(1);
        this.cPoller.destroy();
        expect(Backbone.Poller.size()).toBe(0);
      });

      it('doesnt destroy the same poller twice', function () {
        this.mPoller.destroy();
        expect(Backbone.Poller.size()).toBe(1);

        this.mPoller.destroy();
        expect(Backbone.Poller.size()).toBe(1);

        this.mPoller.destroy();
        expect(Backbone.Poller.size()).toBe(1);
      });
    });

    it('Should stop when invoking stop()', function () {
      this.mPoller.start();

      expect(this.mPoller.active()).toBe(true);
      this.mPoller.stop();

      expect(this.mPoller.active()).toBe(false);
    });

    it('Should abort XHR (only once) when invoking stop()', function () {
      expect(this.mPoller.xhr).toBeNull();

      this.mPoller.start();

      expect(this.mPoller.xhr).not.toBeNull();
      spyOn(this.mPoller.xhr, 'abort').and.callThrough();

      var spy = this.mPoller.xhr.abort;
      expect(spy.calls.count()).toEqual(0);

      this.mPoller.stop();
      expect(spy.calls.count()).toEqual(1);
      expect(this.mPoller.xhr).toBeNull();

      this.mPoller.stop();
      expect(spy.calls.count()).toEqual(1);
    });

    it('Should stop when condition is satisfied', function (done) {
      var bool = true,
          options = {delay: 10, condition: function () { return bool; }},
          poller = Backbone.Poller.get(this.model, options).start();

      expect(poller.active()).toBe(true);

      bool = false;

      setTimeout(function () {
        expect(poller.active()).toBe(false);
        done();
      }, 16);
    });

    it('Should fetch more than once when polling a model', function (done) {
      spyOn(this.model, 'fetch').and.callThrough();
      this.mPoller.set({delay: 10}).start();
      setTimeout(function () {
        expect(this.mPoller.active()).toBe(true);
        expect(this.model.fetch.calls.count()).toBe(2);
        done();
      }.bind(this), 12);
    });

    it('Should fetch more than once when polling a collection', function (done) {
      spyOn(this.collection, 'fetch').and.callThrough();
      this.cPoller.set({delay: 10}).start();
      setTimeout(function () {
        expect(this.cPoller.active()).toBe(true);
        expect(this.collection.fetch.calls.count()).toBe(4);
        done();
      }.bind(this), 39);
    });

    it('should maintain a copy of model fetch promise', function () {
      var poller = this.mPoller;
      expect(poller.xhr).toBeNull();
      poller.start();
      expect(poller.xhr).not.toBeNull();
    });

    it('should maintain a timeout Id to manage polling', function () {
      var poller = this.mPoller;
      expect(poller.timeoutId).toBeNull();
      poller.start();
      expect(poller.timeoutId).toEqual(jasmine.any(Number));
    });

    it('should be active when running', function () {
      var poller = this.mPoller;
      expect(poller.active()).toBe(false);
      poller.start();
      expect(poller.active()).toBe(true);
    });

    it('Sould have a reset the poller\'s xhr and timeoutId when stopped', function () {
      var poller = this.mPoller.start().stop();

      expect(poller.active()).toBe(false);
      expect(poller.xhr).toBeNull();
      expect(poller.timeoutId).toBeNull();
    });

    it('Should stop when model is destroyed', function () {
      spyOn(this.model, 'destroy').and.callThrough();
      this.mPoller.start();
      this.model.destroy();
      expect(this.mPoller.active()).toBe(false);
    });

    describe('backoff and getDelay', function () {
      it('return a constanct delay when backoff is undefined', function () {
        this.mPoller.set({delay: 1000});
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(1000);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(1000);
      });

      it('return a constanct delay when backoff is turned off', function () {
        this.mPoller.set({delay: 1000, backoff: false});
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(1000);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(1000);
      });

      it('backoff multiples by 2 by default when enabled', function () {
        this.mPoller.set({delay: [100]});
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(100);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(200);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(400);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(800);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(1600);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(3200);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(6400);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(12800);
      });

      it('backoff stops at the defined value', function () {
        this.mPoller.set({delay: [100, 150]});
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(100);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(150);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(150);
      });

      it('backoff multiples by n when specified', function () {
        this.mPoller.set({delay: [100, 2700, 3]});
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(100);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(300);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(900);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(2700);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(2700);
      });

      it('backoff multiples by custom function when provided', function () {
        this.mPoller.set({delay: [100, 550, function (n) {
          return n * 1.5;
        }]});
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(100);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(150);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(225);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(338);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(506);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(550);
        expect(Backbone.Poller.getDelay(this.mPoller)).toBe(550);
      });
    });
  });

  describe('AMD support', function () {
    window.require = {
      paths: {
        underscore: 'bower_components/underscore/underscore',
        jquery: 'bower_components/jquery/dist/jquery',
        backbone: 'bower_components/backbone/backbone'
      }
    };

    beforeEach(function (done) {
      var self = this;
      function setupPoller() {
        require(['./backbone.poller'], function (Poller) {
          self.Poller = Poller;
        });
        done();
      }
      var node = document.createElement('script');
      node.type = 'text/javascript';
      node.charset = 'utf-8';
      node.async = 'true';
      if (node.attachEvent) {
        node.attachEvent('onreadystatechange', setupPoller);
      }
      else {
        node.addEventListener('load', setupPoller, false);
      }
      node.src = 'bower_components/requirejs/require.js';
      var head = document.getElementsByTagName('head')[0];
      head.appendChild(node);
    });

    afterEach(function () {
      // give Poller back to window to avoid breaking the environment
      // this is dirty but having a AMD env with a non-AMD env gets tricky
      window.Backbone.Poller = this.Poller;
    });

    it('should load as an AMD module', function (done) {
      setTimeout(function () {
        hasManagerAPI(this.Poller);
        done();
      }.bind(this), 100);
    });
  });
});
