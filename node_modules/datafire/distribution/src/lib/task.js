"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CronJob = require('cron').CronJob;

var Context = require('./context');
var Event = require('./event');
var util = require('../util');

var DEFAULT_MAX_HISTORY = 10000;

/**
 * Creates a new Task
 * @class Task
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.timezone
 * @param {Project} opts.project
 * @param {Action} opts.action
 * @param {Object} opts.monitor
 * @param {Action} opts.monitor.action
 * @param {string} opts.monitor.array - field in the action output where the array is found
 * @param {string} opts.monitor.trackBy - field inside each item to use as an ID
 */

var Task = function () {
  function Task(opts) {
    _classCallCheck(this, Task);

    this.id = opts.id;
    this.action = opts.action;
    this.timezone = opts.timezone;
    this.monitor = opts.monitor;
    this.schedule = opts.schedule;
    this.project = opts.project;
    this.input = opts.input;
    this.accounts = opts.accounts;
    this.errorHandler = opts.errorHandler;
    if (!this.schedule) {
      throw new Error("Task " + this.id + " has no schedule");
    }
    if (!this.action) {
      throw new Error("Task " + this.id + " has no action");
    }
  }

  _createClass(Task, [{
    key: 'initializeMonitor',
    value: function initializeMonitor() {
      if (!this.monitor) return Promise.resolve();
      this.seenItems = [];
      return this.runMonitor();
    }
  }, {
    key: 'runMonitor',
    value: function runMonitor() {
      var _this = this;

      if (!this.monitor) return Promise.resolve();
      var accounts = Object.assign({}, this.accounts || {}, this.monitor.accounts || {});
      var monitorCtx = this.project ? this.project.getContext({ accounts: accounts }) : new Context({ accounts: accounts });
      var input = this.monitor.input;
      var maxHistory = this.monitor.maxHistory || DEFAULT_MAX_HISTORY;
      return this.monitor.action.run(this.monitor.input, monitorCtx).then(function (result) {
        var items = util.followKey(_this.monitor.array, result);
        if (!Array.isArray(items)) throw new Error("Monitor for " + _this.id + " did not produce an array");
        var newItems = items.reverse().filter(function (item) {
          var itemID = util.followKey(_this.monitor.trackBy, item);
          if (_this.seenItems.indexOf(itemID) === -1) {
            _this.seenItems.unshift(itemID);
            return true;
          } else {
            return false;
          }
        });
        if (_this.seenItems.length > maxHistory) {
          _this.seenItems.splice(maxHistory);
        }
        return newItems;
      }, function (e) {
        var message = "Error initializing monitor for " + _this.id;
        if (e.toString) {
          message += ':\n' + e.toString();
        }
        throw new Error(message);
      });
    }
  }, {
    key: 'run',
    value: function run() {
      var _this2 = this;

      var prom = Promise.resolve();
      var contextOpts = { accounts: this.accounts, type: 'task' };
      var context = this.project ? this.project.getContext(contextOpts) : new Context(contextOpts);
      var event = { context: context, id: this.id, errorHandler: this.errorHandler };
      if (this.project) {
        event = this.project.monitor.startEvent('task', event);
      } else {
        event = new Event(event);
        event.start();
      }
      if (this.monitor) {
        prom = prom.then(function (_) {
          return _this2.runMonitor();
        }).then(function (newItems) {
          return Promise.all(newItems.map(function (item) {
            return _this2.action.run(item, context);
          }));
        });
      } else {
        prom = prom.then(function (_) {
          return _this2.action.run(_this2.input, context);
        });
      }
      prom = prom.then(function (output) {
        event.output = output;
        event.end();
        return output;
      }, function (error) {
        event.end(error);
        throw error;
      });
      return prom;
    }
  }, {
    key: 'start',
    value: function start() {
      var _this3 = this;

      this.initializeMonitor().then(function (_) {
        var schedule = util.schedule.parse(_this3.schedule);
        var cron = util.schedule.cronToNodeCron(schedule);
        var job = new CronJob(cron, function () {
          return _this3.run();
        }, null, true, _this3.timezone);
      });
    }
  }]);

  return Task;
}();

module.exports = Task;