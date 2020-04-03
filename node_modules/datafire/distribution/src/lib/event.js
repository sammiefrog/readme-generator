'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = require('../util/logger');
var verbose = require('yargs').argv.verbose;
var Context = require('./context');

/**
 * Holds details about an HTTP or Task event, including start and end time
 */

var Event = function () {
  function Event() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Event);

    Object.assign(this, opts);
    if (this.project && this.errorHandler === undefined) {
      this.errorHandler = this.project.events.error;
    }
  }

  /**
   * Start the event
   */


  _createClass(Event, [{
    key: 'start',
    value: function start() {
      this.start = new Date();
    }

    /**
     * End the event
     * @param {string|Error} [error] - an error associated with the event
     */

  }, {
    key: 'end',
    value: function end() {
      var error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      this.end = new Date();
      this.duration = this.end.getTime() - this.start.getTime();
      this.error = typeof error === 'string' ? new Error(error) : error;
      this.success = !error;
      if (verbose) {
        this.log();
      }
      if (this.error && this.errorHandler) {
        var ctx = this.project ? this.project.getContext({ type: 'error' }) : new Context({ type: 'error' });
        this.errorHandler.action.run({ error: this.error, errorContext: this.context }, ctx);
      }
      if (this.project) {
        if (this.type === 'http' && this.project.events.http) {
          this.project.events.http.action.run({
            id: this.id,
            path: this.path,
            method: this.method,
            duration: this.duration,
            statusCode: this.statusCode,
            error: this.error
          });
        } else if (this.type === 'task' && this.project.events.task) {
          this.project.events.task.action.run({
            id: this.id,
            duration: this.duration,
            error: this.error
          });
        }
      }
    }

    /**
     * Log basic event details to the console
     */

  }, {
    key: 'log',
    value: function log() {
      logger.logInfo(this.type + ": " + (this.id || 'unknown'));
      logger.log("duration: " + this.duration + 'ms');
      if (this.success) logger.logSuccess();else logger.logError(this.error && this.error.message || undefined);
    }
  }]);

  return Event;
}();

module.exports = Event;