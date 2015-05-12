/*!
(c) 2012 Uzi Kilon, Splunk Inc.
Backbone Poller 1.0.1
https://github.com/uzikilon/backbone-poller
Backbone Poller may be freely distributed under the MIT license.
*/
(function (root, factory) {
  'use strict';
  if (typeof define == 'function' && define.amd) {
    define(['underscore', 'backbone'], factory);
  }
  else if (typeof require === 'function' && typeof exports === 'object') {
    module.exports = factory(require('underscore'), require('backbone'));
  }
  else {
    root.Backbone.Poller = factory(root._, root.Backbone);
  }
}(this, function (_, Backbone) {
  'use strict';

  // Default settings
  var defaults = {
    delay: 1000,
    condition: function () {
      return true;
    }
  };

  // Available events
  var events = ['start', 'stop', 'fetch', 'success', 'error', 'complete' ];

  var pollers = [];
  function findPoller(model) {
    return _.find(pollers, function (poller) {
      return poller.model === model;
    });
  }

  var PollingManager = {

    // **Backbone.Poller.get(model[, options])**
    // <pre>
    // Returns a singleton instance of a poller for a model
    // Stops it if running
    // If options.autostart is true, will start it
    // Returns a poller instance
    // </pre>
    get: function (model, options) {
      var poller = findPoller(model);
      if (!poller) {
        poller = new Poller(model, options);
        pollers.push(poller);
      }
      else {
        poller.set(options);
      }
      if (options && options.autostart === true) {
        poller.start({silent: true});
      }
      return poller;
    },

    // **Backbone.Poller.size()**
    // <pre>
    // Returns the number of instantiated pollers
    // </pre>
    size: function () {
      return pollers.length;
    },

    // **Backbone.Poller.reset()**
    // <pre>
    // Stops all pollers and removes from the pollers pool
    // </pre>
    reset: function () {
      while (pollers.length) {
        pollers.pop().stop();
      }
    }
  };

  function Poller(model, options) {
    this.model = model;
    this.cid = _.uniqueId('poller');
    this.set(options);
  }

  _.extend(Poller.prototype, Backbone.Events, {

    // **poller.set([options])**
    // <pre>
    // Reset poller options and stops the poller
    // </pre>
    set: function (options) {
      this.options = _.extend({}, defaults, options || {});
      if (this.options.flush) {
        this.off();
      }
      _.each(events, function (name) {
        var callback = this.options[name];
        if (_.isFunction(callback)) {
          this.off(name, callback, this);
          this.on(name, callback, this);
        }
      }, this);

      if (this.model instanceof Backbone.Model) {
        this.listenTo(this.model, 'destroy', this.stop);
      }

      return this.stop({silent: true});
    },
    //
    // **poller.start([options])**
    // <pre>
    // Start the poller
    // Returns a poller instance
    // Triggers a 'start' events unless options.silent is set to true
    // </pre>
    start: function (options) {
      if (!this.active()) {
        options && options.silent || this.trigger('start', this.model);
        this.options.active = true;
        if (this.options.delayed) {
          delayedRun(this, _.isNumber(this.options.delayed) && this.options.delayed);
        } else {
          run(this);
        }
      }
      return this;
    },
    // **poller.stop([options])**
    // <pre>
    // Stops the poller
    // Aborts any running XHR call
    // Returns a poller instance
    // Triggers a 'stop' events unless options.silent is set to true
    // </pre>
    stop: function (options) {
      options && options.silent || this.trigger('stop', this.model);
      this.options.active = false;
      this.xhr && this.xhr.abort && this.xhr.abort();
      this.xhr = null;
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      return this;
    },
    // **poller.active()**
    // <pre>
    // Returns a boolean for poller status
    // </pre>
    active: function () {
      return this.options.active === true;
    }
  });

  function run(poller) {
    if (validate(poller)) {
      var options = _.extend({}, poller.options, {
        success: function (model, resp) {
          poller.trigger('success', model, resp);
          delayedRun(poller);
        },
        error: function (model, resp) {
          if (poller.options.continueOnError) {
            poller.trigger('error', model, resp);
            delayedRun(poller);
          } else {
            poller.stop({silent: true});
            poller.trigger('error', model, resp);
          }
        }
      });
      poller.trigger('fetch', poller.model);
      poller.xhr = poller.model.fetch(options);
    }
  }

  var backoff = {};
  function getDelay(poller) {
    if (_.isNumber(poller.options.delay)) {
      return poller.options.delay;
    }

    var min = poller.options.delay[0],
        max = poller.options.delay[1],
        interval = poller.options.delay[2] || 2;

    if (backoff[poller.cid]) {
      if (_.isFunction(interval)) {
        backoff[poller.cid] = interval(backoff[poller.cid]);
      }
      else {
        backoff[poller.cid] = backoff[poller.cid] * interval;
      }
    }
    else {
      backoff[poller.cid] = 1;
    }

    var res = Math.round(min * backoff[poller.cid]);
    if (max && max > 0) {
      res = Math.min(res, max);
    }
    return res;
  }

  function delayedRun(poller, delay) {
    if (validate(poller)) {
      poller.timeoutId = _.delay(run, delay || getDelay(poller), poller);
    }
  }

  function validate(poller) {
    if (! poller.options.active) {
      return false;
    }
    if (poller.options.condition(poller.model) !== true) {
      poller.stop({silent: true});
      poller.trigger('complete', poller.model);
      return false;
    }
    return true;
  }

  PollingManager.getDelay   = getDelay;         // test hook
  PollingManager.prototype  = Poller.prototype; // test hook

  return PollingManager;

}));
