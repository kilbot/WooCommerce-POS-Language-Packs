'use strict';

var path = require('path');
var async = require('async');

module.exports = function(grunt) {

  var exports = {
    options: {}
  };

  var asyncQueue = [];

  exports.start = function(done){
    exports.options.locales.forEach(function(locale){
      var files = exports.potFiles();
      files.forEach(function(fileName){
        exports.queue(fileName, locale);
      })
    });

    exports.async(done);
  };

  exports.queue = function(fileName, locale){
    var dest = exports.poPath(fileName, locale);
    if( grunt.file.exists(dest) ){
      asyncQueue.push( exports.queueMerge(fileName, locale, dest) );
    } else {
      asyncQueue.push( exports.queueInit(fileName, locale, dest) );
    }
    asyncQueue.push( exports.queuePo(dest) );
  };

  exports.async = function(done){
    async.eachSeries(asyncQueue, function(options, callback) {
      grunt.util.spawn(options, function(error, result, code) {
        callback(error);
      });
    }, function(error) {
      done(error);
    });
  };

  exports.potFiles = function(){
    return grunt.file.expand({cwd: exports.options.pot}, '**/*.pot');
  };

  exports.poPath = function(fileName, locale){
    var file = fileName.replace('.pot', '-' + locale + '.po');
    return exports.options.cwd + file;
  };

  exports.queueInit = function(fileName, locale, dest){
    var tmpl = exports.options.pot + fileName;

    // Ensure dest folder exists
    grunt.file.mkdir( path.dirname(dest) );

    return {
      cmd : 'msginit',
      args: ['-i', tmpl, '-l', locale, '-o', dest, '--no-translator']
    }
  };

  exports.queueMerge = function(fileName, locale, dest){
    var tmpl = exports.options.pot + fileName;

    return {
      cmd : 'msgmerge',
      args: ['-U', dest, tmpl]
    }
  };

  exports.queuePo = function(po){
    var mo = po.replace('.po', '.mo');

    return {
      cmd : 'msgfmt',
      args: ['-o', mo, po]
    }
  }

  return exports;
}