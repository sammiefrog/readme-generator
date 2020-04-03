"use strict";

var datafire = require('../entry');
var expect = require('chai').expect;

describe("Tasks", function () {
  it('should utilize monitor', function () {
    var items = ['A', 'B', 'C'];
    var monitorAction = new datafire.Action({
      handler: function handler(input) {
        return items;
      }
    });
    var action = new datafire.Action({
      handler: function handler(input) {
        return input;
      }
    });
    var task = new datafire.Task({
      action: action,
      monitor: {
        action: monitorAction
      },
      schedule: 'rate(1 day)'
    });
    return task.initializeMonitor().then(function (allItems) {
      expect(allItems).to.deep.equal(items);
    }).then(function (_) {
      return task.run();
    }).then(function (newItems) {
      expect(newItems.length).to.equal(0);
    }).then(function (_) {
      items.push('D');
      return task.run();
    }).then(function (newItems) {
      expect(newItems.length).to.equal(1);
      expect(newItems[0]).to.equal('D');
    }).then(function (_) {
      return task.run();
    }).then(function (newItems) {
      expect(newItems.length).to.equal(0);
    });
  });

  it('should allow tracking by nested fields', function () {
    var items = [{ person: { name: 'A' } }, { person: { name: 'B' } }, { person: { name: 'C' } }];
    var monitorAction = new datafire.Action({
      handler: function handler(input) {
        return { response: { items: items } };
      }
    });
    var action = new datafire.Action({
      handler: function handler(input) {
        return input.person.name;
      }
    });
    var task = new datafire.Task({
      action: action,
      monitor: {
        action: monitorAction,
        array: 'response.items',
        trackBy: 'person.name'
      },
      schedule: 'rate(1 day)'
    });
    return task.initializeMonitor().then(function (allItems) {
      expect(allItems).to.deep.equal(items);
    }).then(function (_) {
      return task.run();
    }).then(function (newItems) {
      expect(newItems.length).to.equal(0);
    }).then(function (_) {
      items.push({ person: { name: 'D' } });
      return task.run();
    }).then(function (newItems) {
      expect(newItems.length).to.equal(1);
      expect(newItems[0]).to.equal('D');
    }).then(function (_) {
      return task.run();
    }).then(function (newItems) {
      expect(newItems.length).to.equal(0);
    });
  });

  it('should respect maxHistory', function () {
    var items = ['A', 'B', 'C'];
    var monitorAction = new datafire.Action({
      handler: function handler(input) {
        return items;
      }
    });
    var action = new datafire.Action({
      handler: function handler(input) {
        return input;
      }
    });
    var task = new datafire.Task({
      action: action,
      monitor: {
        action: monitorAction,
        maxHistory: 3
      },
      schedule: 'rate(1 day)'
    });
    return task.initializeMonitor().then(function (allItems) {
      expect(allItems).to.deep.equal(items);
      expect(task.seenItems.length).to.equal(3);
    }).then(function (_) {
      return task.run();
    }).then(function (newItems) {
      expect(newItems.length).to.equal(0);
    }).then(function (_) {
      items.unshift('D');
      return task.run();
    }).then(function (newItems) {
      expect(newItems.length).to.equal(1);
      expect(newItems[0]).to.equal('D');
      expect(task.seenItems.length).to.equal(3);
    }).then(function (_) {
      return task.run();
    }).then(function (newItems) {
      expect(newItems.length).to.equal(1);
      expect(newItems[0]).to.equal('C');
      expect(task.seenItems.length).to.equal(3);
    });
  });

  it('should use errorHandler', function () {
    var lastError = null;
    var errorHandler = {
      action: new datafire.Action({
        handler: function handler(input) {
          return lastError = input.error;
        }
      })
    };
    var task = new datafire.Task({
      errorHandler: errorHandler,
      action: new datafire.Action({
        handler: function handler(input) {
          throw new Error("test");
        }
      }),
      schedule: 'rate(1 day)'
    });
    return task.run().then(function (_) {
      throw new Error("shouldn't reach here");
    }, function (e) {
      expect(e.message).to.equal('test');
      expect(lastError.message).to.equal('test');
    });
  });
});