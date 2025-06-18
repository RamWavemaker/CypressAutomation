"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enableAllure = void 0;
Object.defineProperty(exports, "enableReportingOfCypressScreenshots", {
  enumerable: true,
  get: function get() {
    return _cypress.enableReportingOfCypressScreenshots;
  }
});
var _patching = require("../patching.js");
var _cypress = require("./cypress.js");
var _mocha = require("./mocha.js");
var enableAllure = () => {
  (0, _mocha.registerMochaEventListeners)();
  (0, _cypress.registerCypressEventListeners)();
  (0, _mocha.injectFlushMessageHooks)();
  (0, _patching.enableScopeLevelAfterHookReporting)();
};
exports.enableAllure = enableAllure;
//# sourceMappingURL=index.js.map