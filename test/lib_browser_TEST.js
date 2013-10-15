'use strict';

var expect = require('chai').expect;
var browser = require('../lib/browser.js');

describe('dalek-driver-sauce Browser', function() {

  it('i should think of proper testing', function(){
    expect(browser).to.be.ok;
  });

});
