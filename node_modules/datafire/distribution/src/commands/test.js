'use strict';

var path = require('path');
var fs = require('fs');
var YAML = require('yamljs');
var logger = require('../util/logger');
var datafire = require('../');

var run = require('./run');

var JSON_FILE_REGEX = /\.json$/;

module.exports = function (args) {
  var project = datafire.Project.main();
  var test = project.tests[args.test];
  if (!test) throw new Error("Test " + args.test + " not found");
  var action = datafire.Action.fromName(test.action, process.cwd());
  return run(Object.assign({}, args, {
    action: test.action,
    input: test.input,
    accounts: test.accounts
  }));
};