"use strict";

var expect = require('chai').expect;
var schedule = require('../util/schedule');

describe('Schedule', function () {
  it('should parse cron', function () {
    expect(schedule.parse('cron(* * * * * *)')).to.equal('* * * * * *');
  });

  it('should parse rate', function () {
    expect(schedule.parse('rate(1 day)')).to.equal('0 0 */1 * * *');
  });

  it('should parse plural rate', function () {
    expect(schedule.parse('rate(3 hours)')).to.equal('0 */3 * * * *');
  });

  it('should convert to node-cron', function () {
    var sched = 'rate(4 months)';
    expect(schedule.cronToNodeCron(schedule.parse(sched))).to.equal('0 0 0 0 */4 *');
  });

  it('should allow 5-part expression', function () {
    var sched = 'cron(0 12 * * 1,3,5)';
    expect(schedule.cronToNodeCron(schedule.parse(sched))).to.equal('0 0 12 * * 1,3,5');
  });
});