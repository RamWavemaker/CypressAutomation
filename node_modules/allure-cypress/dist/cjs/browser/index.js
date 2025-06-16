"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeAllure = void 0;
var _index = require("./events/index.js");
var _state = require("./state.js");
var initializeAllure = () => {
  if ((0, _state.isAllureInitialized)()) {
    return;
  }
  (0, _state.setAllureInitialized)();
  (0, _index.enableAllure)();
  (0, _index.enableReportingOfCypressScreenshots)();
};
exports.initializeAllure = initializeAllure;
//# sourceMappingURL=index.js.map