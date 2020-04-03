'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MAX_EVENTS = 1000;
var Event = require('./event');

/**
 * Holds on to a fixed number of project events
 */

var Monitor = function () {
  function Monitor() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Monitor);

    this.maxEvents = opts.maxEvents || MAX_EVENTS;
    this.project = opts.project;
    this.events = {
      http: [],
      task: []
    };
  }

  /**
   * Starts a new event and adds it to the list
   * @param {string} type - event type (http or task)
   * @param {Object} evt - options for created event
   */


  _createClass(Monitor, [{
    key: 'startEvent',
    value: function startEvent(type) {
      var evt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      evt.type = type;
      evt.project = this.project;
      var event = new Event(evt);
      event.start();
      var events = this.events[event.type];
      if (events.length >= this.maxEvents) events.shift();
      events.push(event);
      return event;
    }
  }]);

  return Monitor;
}();

module.exports = Monitor;