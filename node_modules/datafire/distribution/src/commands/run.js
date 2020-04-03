'use strict';

var path = require('path');
var fs = require('fs');
var YAML = require('yamljs');
var logger = require('../util/logger');
var datafire = require('../');

var JSON_FILE_REGEX = /\.json$/;

module.exports = function (args) {
  var action = datafire.Action.fromName(args.action, process.cwd());
  if (typeof args.input === 'string' && action.inputSchema.type !== 'string') {
    args.input = JSON.parse(args.input);
  }
  if (args.inputFile) {
    var content = fs.readFileSync(args.inputFile, 'utf8');
    if (args.inputFile.match(JSON_FILE_REGEX)) {
      args.input = JSON.parse(content);
    } else {
      args.input = YAML.parse(content);
    }
  }
  var project = datafire.Project.main();
  var context = project.getContext({
    type: 'command',
    accounts: args.accounts
  });
  return action.run(args.input, context).then(function (result) {
    if (args.outputFile) {
      var _content = '';
      if (args.outputFile.match(JSON_FILE_REGEX)) {
        _content = JSON.stringify(result, null, 2);
      } else {
        _content = YAML.stringify(result, 10);
      }
      fs.writeFileSync(args.outputFile, _content);
    } else {
      logger.logJSON(result);
    }
  }, function (e) {
    if (!(e instanceof Error)) {
      if (e.statusCode) {
        e = new Error(e.statusCode + ": " + e.body);
      } else if (e.toString) {
        e = new Error(e.toString());
      } else {
        e = new Error("Unknown error");
      }
    }
    return Promise.reject(e);
  });
};