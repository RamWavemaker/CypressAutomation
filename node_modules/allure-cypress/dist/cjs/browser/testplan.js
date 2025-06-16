"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyTestPlan = void 0;
var _allureJsCommons = require("allure-js-commons");
var _state = require("./state.js");
var _utils = require("./utils.js");
var applyTestPlan = (spec, root) => {
  var testPlan = (0, _state.getAllureTestPlan)();
  if (testPlan) {
    var specPath = (0, _utils.resolveSpecRelativePath)(spec);
    for (var suite of iterateSuites(root)) {
      var indicesToRemove = getIndicesOfDeselectedTests(testPlan, spec, specPath, suite.tests);
      removeSortedIndices(suite.tests, indicesToRemove);
    }
  }
};
exports.applyTestPlan = applyTestPlan;
var iterateSuites = function* iterateSuites(parent) {
  var suiteStack = [];
  for (var s = parent; s; s = suiteStack.pop()) {
    yield s;

    // Pushing in reverse allows us to maintain depth-first pre-order traversal -
    // the same order as used by Mocha & Cypress.
    for (var i = s.suites.length - 1; i >= 0; i--) {
      suiteStack.push(s.suites[i]);
    }
  }
};
var getIndicesOfDeselectedTests = (testPlan, spec, specPath, tests) => {
  var indicesToRemove = [];
  tests.forEach((test, index) => {
    var _labels$find;
    var {
      fullNameSuffix,
      labels
    } = (0, _utils.getTestMetadata)(test);
    var fullName = "".concat(specPath, "#").concat(fullNameSuffix);
    var allureId = (_labels$find = labels.find(_ref => {
      var {
        name
      } = _ref;
      return name === _allureJsCommons.LabelName.ALLURE_ID;
    })) === null || _labels$find === void 0 ? void 0 : _labels$find.value;
    if (!includedInTestPlan(testPlan, fullName, allureId)) {
      indicesToRemove.push(index);
    }
  });
  return indicesToRemove;
};
var removeSortedIndices = (arr, indices) => {
  for (var i = indices.length - 1; i >= 0; i--) {
    arr.splice(indices[i], 1);
  }
};
var includedInTestPlan = (testPlan, fullName, allureId) => testPlan.tests.some(test => {
  var _test$id;
  return allureId && ((_test$id = test.id) === null || _test$id === void 0 ? void 0 : _test$id.toString()) === allureId || test.selector === fullName;
});
//# sourceMappingURL=testplan.js.map