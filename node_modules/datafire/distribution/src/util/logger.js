'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var chalk = require('chalk');
var columnify = require('columnify');
var prettyjson = require('prettyjson');

var MAX_DESCRIPTION_LENGTH = 100;

var Logger = function () {
  function Logger() {
    _classCallCheck(this, Logger);
  }

  _createClass(Logger, null, [{
    key: 'stripHtml',
    value: function stripHtml(str) {
      str = str || '';
      return str.replace(/<(?:.|\n)*?>/gm, '');
    }
  }, {
    key: 'chalkAction',
    value: function chalkAction(name, op, skipDescription) {
      var str = chalk.magenta(name);
      if (!skipDescription) {
        var desc = op.description;
        if (desc) str += '\n' + chalk.gray(Logger.stripHtml(desc));
      }
      return str;
    }
  }, {
    key: 'chalkMethod',
    value: function chalkMethod(method) {
      method = method.toUpperCase();
      if (method === 'GET') return chalk.green(method);
      if (method === 'PUT' || method === 'POST' || method === 'PATCH') return chalk.yellow(method);
      if (method === 'DELETE') return chalk.red(method);
      return method;
    }
  }, {
    key: 'chalkType',
    value: function chalkType(type) {
      if (!type) return '';
      if (typeof type !== 'string') {
        return type.map(function (t) {
          return Logger.chalkType(t);
        }).join('|');
      }
      if (type === 'string') return chalk.green(type);
      if (type === 'integer' || type === 'number') return chalk.blue(type);
      if (type === 'boolean') return chalk.cyan(type);
      if (type === 'array' || type === 'object') return chalk.yellow(type);
      if (type === 'null') return chalk.red(type);
      return type;
    }
  }, {
    key: 'chalkCode',
    value: function chalkCode(code) {
      if (code.startsWith('2')) return chalk.green(code);
      if (code.startsWith('3')) return chalk.yellow(code);
      if (code.startsWith('4')) return chalk.orange(code);
      if (code.startsWith('5')) return chalk.red(code);
    }
  }, {
    key: 'padString',
    value: function padString(str, len) {
      while (str.length < len) {
        str += ' ';
      }return str;
    }
  }, {
    key: 'logHeading',
    value: function logHeading(str) {
      Logger.log(chalk.magenta(str));
    }
  }, {
    key: 'logColumns',
    value: function logColumns(cols, options) {
      options = options || {};
      options.columnSplitter = '  ';
      Logger.log(columnify(cols, options));
    }
  }, {
    key: 'logJSON',
    value: function logJSON(json) {
      if (json === undefined) return;
      Logger.log(prettyjson.render(json, { keysColor: 'white', stringColor: 'green', dashColor: 'white' }));
    }
  }, {
    key: 'logSchema',
    value: function logSchema(schema, indent, name, hideType) {
      var logged = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];

      indent = indent || '';
      if (indent.length > 12 || logged.indexOf(schema) !== -1) return Logger.log(indent + '...');
      logged.push(schema);
      var toLog = indent;
      if (name) toLog += chalk.white(Logger.padString(name + ': ', 14));
      toLog += Logger.chalkType(schema.type);
      if (schema.items) {
        toLog += '[' + Logger.chalkType(schema.items.type) + ']';
      }
      if (schema.description) {
        var desc = chalk.gray(Logger.truncate(schema.description, 60, true));
        toLog += '\n' + indent + desc + '\n';
      }
      if (hideType) toLog = '';
      if (schema.properties) {
        if (toLog) Logger.log(toLog);
        for (var propName in schema.properties) {
          var prop = schema.properties[propName];
          if (schema.required && schema.required.indexOf(propName) !== -1) {
            propName += '*';
          }
          Logger.logSchema(prop, indent + '  ', propName, false, logged);
        }
      } else if (schema.items) {
        if (schema.items.properties || schema.items.items) {
          if (toLog) Logger.log(toLog);
          Logger.logSchema(schema.items, indent, '', true, logged);
        } else {
          toLog = toLog || indent + Logger.chalkType('array');
          Logger.log(toLog);
        }
      } else {
        if (toLog) Logger.log(toLog);
      }
      if (schema.allOf) {
        schema.allOf.forEach(function (subschema) {
          return Logger.logSchema(subschema, indent, '', true, logged);
        });
      }
      // TODO: anyOf, oneOf
    }
  }, {
    key: 'logIntegration',
    value: function logIntegration(name, spec) {
      Logger.log(chalk.magenta(name));
      if (spec.info.title) Logger.log('  ' + chalk.blue(spec.info.title));
      Logger.logDescription(spec.info.description, '  ');
    }
  }, {
    key: 'logAction',
    value: function logAction(name, op) {
      Logger.log(Logger.chalkAction(name, op));
    }
  }, {
    key: 'truncate',
    value: function truncate(str, len, chomp) {
      if (chomp) {
        var newline = str.indexOf('\n');
        if (newline !== -1) str = str.substring(0, newline);
      }
      if (str.length > len) {
        str = str.substring(0, len - 3) + '...';
      }
      return str;
    }
  }, {
    key: 'logDescription',
    value: function logDescription(str, indent) {
      if (!str) return;
      indent = indent || '';
      str = Logger.stripHtml(str);
      str = Logger.truncate(str.trim(), MAX_DESCRIPTION_LENGTH, true);
      Logger.log(indent + chalk.gray(str));
    }
  }, {
    key: 'logParameters',
    value: function logParameters(parameters) {
      if (!parameters || !parameters.length) {
        Logger.log('No parameters');
        return;
      };
      var requestSchema = null;
      var paramDescriptions = parameters.map(function (p) {
        var ret = { parameter: p.name };
        ret.type = Logger.chalkType(p.type);
        ret.required = p.required ? chalk.red('required') : '';
        if (p.description) {
          ret.description = chalk.gray(p.description);
        }
        if (p.enum) {
          if (ret.description) ret.description += ' | ';else ret.description = '';
          ret.description += chalk.gray('One of: ') + p.enum.map(function (n) {
            return chalk.yellow(n);
          }).join(', ');
        }
        if (p.schema) requestSchema = p.schema;
        return ret;
      });
      Logger.log('Parameters');
      Logger.log(columnify(paramDescriptions, {
        columnSplitter: '  ',
        showHeaders: false,
        config: {
          description: {
            maxWidth: 80
          }
        }
      }));
      if (requestSchema) {
        Logger.log('\nRequest body');
        Logger.logSchema(requestSchema);
      }
    }
  }, {
    key: 'logResponse',
    value: function logResponse(response) {
      if (!response || !response.schema) return;
      Logger.log('Response body');
      Logger.logSchema(response.schema);
    }
  }, {
    key: 'logFlow',
    value: function logFlow(flow) {
      Logger.log(chalk.magenta(flow.name));
      Logger.log(chalk.gray(flow.description));
      flow.steps.forEach(function (step) {
        var opName = step.operation instanceof Function ? '(custom)' : step.operation.integration.name + ' -> ' + step.operation.name;
        console.log('  ' + chalk.blue(step.name) + ': ' + chalk.yellow(opName));
      });
    }
  }, {
    key: 'logURL',
    value: function logURL(str) {
      Logger.log('\n' + chalk.yellow(str) + '\n');
    }
  }, {
    key: 'logSuccess',
    value: function logSuccess(str) {
      str = str || 'Success';
      Logger.log(chalk.green(str));
    }
  }, {
    key: 'logInfo',
    value: function logInfo(str) {
      Logger.log(chalk.blue(str));
    }
  }, {
    key: 'logError',
    value: function logError(str) {
      str = str || 'Error';
      Logger.log(chalk.red(str));
    }
  }, {
    key: 'logWarning',
    value: function logWarning(str) {
      Logger.log(chalk.yellow(str));
    }
  }, {
    key: 'log',
    value: function log(str) {
      if (Logger.silent) return;
      if (str === undefined) str = '';
      console.log(str);
    }
  }]);

  return Logger;
}();

module.exports = Logger;