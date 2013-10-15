/*!
 *
 * Copyright (c) 2013 Sebastian Golasch
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

'use strict';

// ext. libs
var Q = require('q');
var fs = require('fs');

/**
 * Screenshot related methods
 *
 * @module Driver
 * @class Screenshot
 * @namespace Dalek.DriverNative.Commands
 */

var Screenshot = {

  /**
   * Makes an screenshot of the current page
   *
   * @method screenshot
   * @param {string} path Root directory path
   * @param {string} pathname Pathname of the screenshot path
   * @param {string} hash Unique hash of that fn call
   * @param {string} uuid Unique hash of that fn call
   * @chainable
   */

  screenshot: function (path, pathname, hash, uuid) {
    this.actionQueue.push(this.webdriverClient.screenshot.bind(this.webdriverClient));
    this.actionQueue.push(this._screenshotCb.bind(this, path, pathname, hash, uuid));
    return this;
  },

  /**
   * Sends out an event with the results of the `screenshot` call
   * and stores the screenshot in the filesystem
   *
   * @method _screenshotCb
   * @param {string} path Root directory path
   * @param {string} pathname Pathname of the screenshot path
   * @param {string} hash Unique hash of that fn call
   * @param {string} uuid Unique hash of that fn call
   * @param {string} result Serialized JSON result of the screenshot call
   * @return {object} promise Screenshot promise
   * @private
   */

  _screenshotCb: function (path, pathname, hash, uuid, result) {
    var deferred = Q.defer();
    // replace base64 metadata
    var base64Data = JSON.parse(result).value.replace(/^data:image\/png;base64,/,'');
    // replace placeholders
    var realpath = this._replacePathPlaceholder(path + pathname);
    // check if we need to add a new directory
    this._recursiveMakeDirSync(realpath.substring(0, realpath.lastIndexOf('/')));
    // write the screenshot
    fs.writeFileSync(realpath, base64Data, 'base64');
    this.events.emit('driver:message', {key: 'screenshot', value: realpath, uuid: hash, hash: hash});
    deferred.resolve();
    return deferred.promise;
  },

  /**
   * Recursige mkdir helper
   *
   * @method _recursiveMakeDirSync
   * @param {string} path Path to create
   * @private
   */

  _recursiveMakeDirSync: function (path) {
    var pathSep = require('path').sep;
    var dirs = path.split(pathSep);
    var root = '';

    while (dirs.length > 0) {
      var dir = dirs.shift();
      if (dir === '') {
        root = pathSep;
      }
      if (!fs.existsSync(root + dir)) {
        fs.mkdirSync(root + dir);
      }
      root += dir + pathSep;
    }
  },

  /**
   * Return the formatted os name
   *
   * @method _parseOS
   * @param {string} Pathname 
   * @return {string} Formatted pathname
   * @private
   */

  _replacePathPlaceholder: function (pathname) {
    pathname = pathname.replace(':browser', this.browserName);
    pathname = pathname.replace(':version', this._parseBrowserVersion(this.sessionStatus.version));
    pathname = pathname.replace(':timestamp', Math.round(new Date().getTime() / 1000));
    pathname = pathname.replace(':osVersion', this._parseOSVersion(this.driverStatus.os.version));
    pathname = pathname.replace(':os', this._parseOS(this.driverStatus.os.name));
    pathname = pathname.replace(':datetime', this._parseDatetime());
    pathname = pathname.replace(':date', this._parseDate());
    pathname = pathname.replace(':viewport', this._parseViewport());
    return pathname;
  },

  /**
   * Return the formatted os name
   *
   * @method _parseOS
   * @return {string} OS name
   * @private
   */

  _parseOS: function (os) {
    var mappings = {
      'mac': 'OSX',
      'Mac OS X': 'OSX'
    };
    return mappings[os] || 'unknown';
  },

  /**
   * Return the formatted os version
   *
   * @method _parseOSVersion
   * @return {string} OS version
   * @private
   */

  _parseOSVersion: function (version) {
    var vs = version.replace(/[^0-9\\.]/g, '');
    vs = vs.replace(/\./g, '_');
    return vs;
  },

  /**
   * Return the formatted browser version
   *
   * @method _parseBrowserVersion
   * @return {string} Browser version
   * @private
   */
  
  _parseBrowserVersion: function (version) {
    return version.replace(/\./g, '_');
  },

  /**
   * Return the formatted date
   *
   * @method _parseDate
   * @return {string} Date
   * @private
   */

  _parseDate: function () {
    var date = new Date();
    var dateStr = '';
    var day = date.getDate();
    var month = date.getMonth();

    month = (month+'').length === 1 ? '0' + month : month;
    day = (day+'').length === 1 ? '0' + day : day;

    dateStr += month + '_';
    dateStr += day + '_';
    dateStr += date.getFullYear();

    return dateStr;
  },

  /**
   * Return the formatted datetime
   *
   * @method _parseDatetime
   * @return {string} Datetime
   * @private
   */

  _parseDatetime: function () {
    var date = new Date();
    var dateStr = this._parseDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    hours = (hours+'').length === 1 ? '0' + hours : hours;
    minutes = (minutes+'').length === 1 ? '0' + minutes : minutes;
    seconds = (seconds+'').length === 1 ? '0' + seconds : seconds;

    dateStr = dateStr + '_' + hours;
    dateStr = dateStr + '_' + minutes;
    dateStr = dateStr + '_' + seconds;

    return dateStr;
  },

  /**
   * Return the formatted viewport
   *
   * @method _parseViewport
   * @return {string} Viewport
   * @private
   */

  _parseViewport: function () {
    var viewport = this.config.get('viewport');
    return 'w' + viewport.width + '_h' + viewport.height;
  }

};

/**
 * Mixes in screenshot methods
 *
 * @param {Dalek.DriverNative} DalekNative Native driver base class
 * @return {Dalek.DriverNative} DalekNative Native driver base class
 */

module.exports = function (DalekNative) {
  // mixin methods
  Object.keys(Screenshot).forEach(function (fn) {
    DalekNative.prototype[fn] = Screenshot[fn];
  });

  return DalekNative;
};
