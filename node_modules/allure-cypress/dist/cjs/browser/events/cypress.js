"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerCypressEventListeners = exports.enableReportingOfCypressScreenshots = void 0;
var _commandLog = require("../commandLog.js");
var _lifecycle = require("../lifecycle.js");
var _steps = require("../steps.js");
var _utils = require("../utils.js");
var registerCypressEventListeners = () => Cypress.on("fail", onFail).on("log:added", onLogAdded);
exports.registerCypressEventListeners = registerCypressEventListeners;
var enableReportingOfCypressScreenshots = () => Cypress.Screenshot.defaults({
  onAfterScreenshot
});
exports.enableReportingOfCypressScreenshots = enableReportingOfCypressScreenshots;
var onAfterScreenshot = function onAfterScreenshot() {
  for (var _len = arguments.length, _ref = new Array(_len), _key = 0; _key < _len; _key++) {
    _ref[_key] = arguments[_key];
  }
  var [, {
    name: originalName,
    path
  }] = _ref;
  var name = originalName !== null && originalName !== void 0 ? originalName : (0, _utils.getFileNameFromPath)(path);
  (0, _lifecycle.reportScreenshot)(path, name);
  (0, _commandLog.setupScreenshotAttachmentStep)(originalName, name);
};
var onLogAdded = (_, entry) => {
  if ((0, _commandLog.shouldCreateStepFromCommandLogEntry)(entry)) {
    (0, _commandLog.startCommandLogStep)(entry);
  }
};
var onFail = error => {
  (0, _steps.reportStepError)(error);

  // If there are more "fail" handlers yet to run, it's not our responsibility to throw.
  // Otherwise, we won't give them any chance to do their job (EventEmitter stops executing handlers as soon
  // as one of them throws - that is also true for eventemitter2, which is used by the browser-side of Cypress).
  if (noSubsequentFailListeners()) {
    throw error;
  }
};
var noSubsequentFailListeners = () => Object.is(Cypress.listeners("fail").at(-1), onFail);
//# sourceMappingURL=cypress.js.map