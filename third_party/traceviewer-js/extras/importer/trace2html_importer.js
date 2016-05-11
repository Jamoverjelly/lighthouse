/**
Copyright (c) 2014 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("../../importer/importer.js");
require("../../importer/simple_line_reader.js");
require("../../base/base64.js");
require("../../model/model.js");

'use strict';

global.tr.exportTo('tr.e.importer', function() {

  function Trace2HTMLImporter(model, events) {
    this.importPriority = 0;
  }

  Trace2HTMLImporter.subtraces_ = [];

  function _extractEventsFromHTML(text) {
    // Clear the array before pushing data to it.
    Trace2HTMLImporter.subtraces_ = [];

    var r = new tr.importer.SimpleLineReader(text);

    // Try to find viewer-data...
    while (true) {
      if (!r.advanceToLineMatching(
          new RegExp('^<\s*script id="viewer-data" ' +
                     'type="(application\/json|text\/plain)">$')))
        break;

      r.beginSavingLines();
      if (!r.advanceToLineMatching(/^<\/\s*script>$/))
        return failure;

      var raw_events = r.endSavingLinesAndGetResult();

      // Drop off first and last event as it contains the end script tag.
      raw_events = raw_events.slice(1, raw_events.length - 1);
      var data64 = raw_events.join('\n');
      var buffer = new ArrayBuffer(
          tr.b.Base64.getDecodedBufferLength(data64));
      var len = tr.b.Base64.DecodeToTypedArray(data64, new DataView(buffer));
      Trace2HTMLImporter.subtraces_.push(buffer.slice(0, len));
    }
  }

  function _canImportFromHTML(text) {
    if (/^<!DOCTYPE html>/.test(text) === false)
      return false;

    // Try to find viewer-data...
    _extractEventsFromHTML(text);
    if (Trace2HTMLImporter.subtraces_.length === 0)
      return false;
    return true;
  }

  Trace2HTMLImporter.canImport = function(events) {
    return _canImportFromHTML(events);
  };

  Trace2HTMLImporter.prototype = {
    __proto__: tr.importer.Importer.prototype,

    get importerName() {
      return 'Trace2HTMLImporter';
    },

    isTraceDataContainer: function() {
      return true;
    },

    extractSubtraces: function() {
      return Trace2HTMLImporter.subtraces_;
    },

    importEvents: function() {
    }
  };


  tr.importer.Importer.register(Trace2HTMLImporter);


  return {
    Trace2HTMLImporter: Trace2HTMLImporter
  };
});
