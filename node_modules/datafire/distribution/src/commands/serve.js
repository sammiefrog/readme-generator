'use strict';

var YAML = require('yamljs');
var path = require('path');
var fs = require('fs');
var datafire = require('../lib');

module.exports = function (args) {
  args.port = args.port || 3000;
  args.directory = args.directory || process.cwd();
  var project = datafire.Project.fromDirectory(args.directory);
  return project.serve(args);
};