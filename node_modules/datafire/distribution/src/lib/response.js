"use strict";

/**
 * @class
 * An HTTP response from ProjectServer
 *
 * @param {Object} [opts]
 * @param {number} [opts.statusCode]
 * @param {*} [opts.json] - JSON-serializable object to pass as body
 * @param {string} [opts.body] - body to send
 * @param {Object} [opts.headers]
 * @param {string} [opts.encoding]
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var Response = module.exports = function () {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  this._isResponse = true;
  this.statusCode = opts.statusCode || 200;
  this.body = opts.body || '';
  this.encoding = opts.encoding || 'utf8';
  this.headers = opts.headers || {};
  if (opts.json !== undefined) {
    this.headers['Content-Type'] = 'application/json';
    this.body = JSON.stringify(opts.json, null, 2);
  }
};

/**
 * Check if the given object is a Response.
 * instanceof is too weak; in particular if the CLI and project versions
 * of DataFire are mismatched, it will return false.
 */
Response.isResponse = function (obj) {
  if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return false;
  if (obj instanceof Response || obj._isResponse) return true;
  return false;
};

/**
 * Send the response to an express 'res'.
 */
Response.prototype.send = function (res) {
  res.status(this.statusCode);
  for (var header in this.headers) {
    res.set(header, this.headers[header]);
  }
  res.end(this.body, this.encoding);
};

Response.prototype.toString = function () {
  return "Status code " + this.statusCode + ":\n" + this.body;
};

/**
 * Responses (particularly with statusCode >= 300) can be thrown.
 */
Response.prototype.toError = function () {
  return new Error(this.toString());
};

/**
 * Get the default response.
 * If 'body' is an Error, sends 500, otherwise 200.
 * @param {*|Error} body - what to send back
 */
Response.default = function (body) {
  var statusCode = 200;
  if (body instanceof Error) {
    statusCode = body.statusCode || 500;
    body = { error: body.message };
  }
  return new Response({
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body, null, 2)
  });
};