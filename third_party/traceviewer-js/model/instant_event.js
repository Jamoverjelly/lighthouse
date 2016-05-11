/**
Copyright (c) 2013 The Chromium Authors. All rights reserved.
Use of this source code is governed by a BSD-style license that can be
found in the LICENSE file.
**/

require("./timed_event.js");
require("../value/unit.js");

'use strict';

global.tr.exportTo('tr.model', function() {
  var InstantEventType = {
    GLOBAL: 1,
    PROCESS: 2
  };

  /**
   * An InstantEvent is a zero-duration event.
   *
   * @constructor
   */
  function InstantEvent(category, title, colorId, start, args) {
    tr.model.TimedEvent.call(this, start);

    this.category = category || '';
    this.title = title;
    this.colorId = colorId;
    this.args = args;

    this.type = undefined;
  };

  InstantEvent.prototype = {
    __proto__: tr.model.TimedEvent.prototype
  };

  /**
   * A GlobalInstantEvent is a zero-duration event that's not tied to any
   * particular process.
   *
   * An example is a trace event that's issued when a new USB device is plugged
   * into the machine.
   *
   * @constructor
   */
  function GlobalInstantEvent(category, title, colorId, start, args) {
    InstantEvent.apply(this, arguments);
    this.type = InstantEventType.GLOBAL;
  };

  GlobalInstantEvent.prototype = {
    __proto__: InstantEvent.prototype,
    get userFriendlyName() {
      return 'Global instant event ' + this.title + ' @ ' +
          tr.v.Unit.byName.timeStampInMs.format(start);
    }
  };

  /**
   * A ProcessInstantEvent is a zero-duration event that's tied to a
   * particular process.
   *
   * An example is a trace event that's issued when a kill signal is received.
   *
   * @constructor
   */
  function ProcessInstantEvent(category, title, colorId, start, args) {
    InstantEvent.apply(this, arguments);
    this.type = InstantEventType.PROCESS;
  };

  ProcessInstantEvent.prototype = {
    __proto__: InstantEvent.prototype,

    get userFriendlyName() {
      return 'Process-level instant event ' + this.title + ' @ ' +
          tr.v.Unit.byName.timeStampInMs.format(start);
    }
  };

  tr.model.EventRegistry.register(
      InstantEvent,
      {
        name: 'instantEvent',
        pluralName: 'instantEvents',
        singleViewElementName: 'tr-ui-a-single-instant-event-sub-view',
        multiViewElementName: 'tr-ui-a-multi-instant-event-sub-view'
      });

  return {
    GlobalInstantEvent: GlobalInstantEvent,
    ProcessInstantEvent: ProcessInstantEvent,

    InstantEventType: InstantEventType,
    InstantEvent: InstantEvent
  };
});
