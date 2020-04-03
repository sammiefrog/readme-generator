'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Creates a new context, which can be passed to actions.
 * @class
 * @param {Object} options
 * @param {string} options.type - The context type (e.g. task or http)
 * @param {Object} options.accounts - list of accounts, keyed by alias
 * @param {Object} options.variables - list of variables, keyed by name
 * @param {Object} options.request - HTTP request details
 */
var Context = function Context() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  _classCallCheck(this, Context);

  this.results = {};
  this.type = opts.type || 'unknown';
  this.variables = opts.variables || {};
  this.accounts = {};
  for (var key in opts.accounts || {}) {
    this.accounts[key] = opts.accounts[key];
  }
  for (var _key in this.accounts) {
    if (typeof this.accounts[_key] === 'string') {
      this.accounts[_key] = this.accounts[this.accounts[_key]];
    }
  }
  this.startTime = new Date();
  if (opts.request) this.request = opts.request;
};

module.exports = Context;