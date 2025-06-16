"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.throwAfterSpecCompletion = exports.reportTestStart = exports.reportTestSkip = exports.reportTestPass = exports.reportTestOrHookFail = exports.reportTestEnd = exports.reportSuiteStart = exports.reportSuiteEnd = exports.reportStepStop = exports.reportStepStart = exports.reportScreenshot = exports.reportRunStart = exports.reportHookStart = exports.reportHookEnd = exports.flushRuntimeMessages = exports.completeSpecOnAfterHookFailure = exports.completeSpecIfNoAfterHookLeft = exports.completeSpecAsync = exports.completeHookErrorReporting = void 0;
var _allureJsCommons = require("allure-js-commons");
var _sdk = require("allure-js-commons/sdk");
var _runtime = require("./runtime.js");
var _state = require("./state.js");
var _steps = require("./steps.js");
var _utils = require("./utils.js");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var reportRunStart = () => {
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_run_start",
    data: {}
  });
};
exports.reportRunStart = reportRunStart;
var reportSuiteStart = suite => {
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_suite_start",
    data: {
      id: suite.id,
      name: suite.title,
      root: suite.root,
      start: Date.now()
    }
  });
};
exports.reportSuiteStart = reportSuiteStart;
var reportSuiteEnd = suite => {
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_suite_end",
    data: {
      root: suite.root,
      stop: Date.now()
    }
  });
};
exports.reportSuiteEnd = reportSuiteEnd;
var reportHookStart = (hook, start) => {
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_hook_start",
    data: {
      name: hook.title,
      scopeType: hook.hookName.includes("each") ? "each" : "all",
      position: hook.hookName.includes("before") ? "before" : "after",
      start: start !== null && start !== void 0 ? start : Date.now()
    }
  });
};
exports.reportHookStart = reportHookStart;
var reportHookEnd = hook => {
  var _hook$duration;
  (0, _steps.finalizeSteps)();
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_hook_end",
    data: {
      duration: (_hook$duration = hook.duration) !== null && _hook$duration !== void 0 ? _hook$duration : 0
    }
  });
};
exports.reportHookEnd = reportHookEnd;
var reportTestStart = test => {
  (0, _state.setCurrentTest)(test);
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_test_start",
    data: (0, _utils.getTestStartData)(test)
  });
  (0, _utils.markTestAsReported)(test);
};
exports.reportTestStart = reportTestStart;
var reportStepStart = (id, name) => {
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_step_start",
    data: {
      id,
      name,
      start: Date.now()
    }
  });
};
exports.reportStepStart = reportStepStart;
var reportStepStop = (step, status, statusDetails) => {
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_step_stop",
    data: (0, _utils.getStepStopData)(step, status, statusDetails)
  });
};
exports.reportStepStop = reportStepStop;
var reportTestPass = () => {
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_test_pass",
    data: {}
  });
};
exports.reportTestPass = reportTestPass;
var reportTestOrHookFail = err => {
  var status = (0, _sdk.getStatusFromError)(err);
  var statusDetails = (0, _sdk.getMessageAndTraceFromError)(err);
  (0, _steps.stopAllSteps)(status, statusDetails);
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_fail",
    data: {
      status,
      statusDetails
    }
  });
};
exports.reportTestOrHookFail = reportTestOrHookFail;
var completeHookErrorReporting = (hook, err) => {
  var isEachHook = hook.hookName.includes("each");
  var suite = hook.parent;
  var testFailData = (0, _utils.getStatusDataOfTestSkippedByHookError)(hook.title, isEachHook, err, suite);

  // Cypress doens't emit 'hook end' if the hook has failed.
  reportHookEnd(hook);

  // Cypress doens't emit 'test end' if the hook has failed.
  // We must report the test's end manualy in case of a 'before each' hook.
  reportCurrentTestIfAny();

  // Cypress skips the remaining tests in the suite of a failed hook.
  // We should include them to the report manually.
  reportRemainingTests(suite, testFailData);
};
exports.completeHookErrorReporting = completeHookErrorReporting;
var reportTestSkip = test => {
  if ((0, _utils.isTestReported)(test)) {
    (0, _steps.stopAllSteps)(_allureJsCommons.Status.SKIPPED, {
      message: "The test was skipped before the command was completed"
    });
  } else {
    reportTestStart(test);
  }
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_test_skip",
    data: (0, _utils.getTestSkipData)()
  });
};
exports.reportTestSkip = reportTestSkip;
var reportTestEnd = test => {
  var _test$duration, _retries;
  (0, _steps.finalizeSteps)();
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_test_end",
    data: {
      duration: (_test$duration = test.duration) !== null && _test$duration !== void 0 ? _test$duration : 0,
      retries: (_retries = test._retries) !== null && _retries !== void 0 ? _retries : 0
    }
  });
  (0, _state.dropCurrentTest)();
};
exports.reportTestEnd = reportTestEnd;
var reportScreenshot = (path, name) => {
  (0, _state.enqueueRuntimeMessage)({
    type: "attachment_path",
    data: {
      path,
      name,
      contentType: _allureJsCommons.ContentType.PNG
    }
  });
};
exports.reportScreenshot = reportScreenshot;
var completeSpecIfNoAfterHookLeft = context => {
  if ((0, _utils.isLastRootAfterHook)(context)) {
    var hook = context.test;
    if (!(0, _utils.isAllureHook)(hook)) {
      reportHookEnd(hook);
    }
    return completeSpecAsync();
  }
};
exports.completeSpecIfNoAfterHookLeft = completeSpecIfNoAfterHookLeft;
var completeSpecOnAfterHookFailure = (context, hookError) => {
  try {
    reportTestOrHookFail(hookError);
    completeHookErrorReporting(context.test, hookError);

    // cy.task's then doesn't have onrejected, that's why we don't log async Allure errors here.
    return completeSpecAsync();
  } catch (allureError) {
    logAllureRootAfterError(context, allureError);
  }
};
exports.completeSpecOnAfterHookFailure = completeSpecOnAfterHookFailure;
var throwAfterSpecCompletion = (context, err) => {
  var _completeSpecOnAfterH;
  var chain = (_completeSpecOnAfterH = completeSpecOnAfterHookFailure(context, err)) === null || _completeSpecOnAfterH === void 0 ? void 0 : _completeSpecOnAfterH.then(() => {
    throw err;
  });
  if (!chain) {
    throw err;
  }
};
exports.throwAfterSpecCompletion = throwAfterSpecCompletion;
var flushRuntimeMessages = () => (0, _runtime.getTestRuntime)().flushAllureMessagesToTask("reportAllureCypressSpecMessages");
exports.flushRuntimeMessages = flushRuntimeMessages;
var completeSpecAsync = () => (0, _runtime.getTestRuntime)().flushAllureMessagesToTaskAsync("reportFinalAllureCypressSpecMessages");
exports.completeSpecAsync = completeSpecAsync;
var reportCurrentTestIfAny = () => {
  var currentTest = (0, _state.getCurrentTest)();
  if (currentTest) {
    reportTestEnd(currentTest);
  }
};
var reportRemainingTests = (suite, testFailData) => {
  for (var test of (0, _utils.iterateTests)(suite)) {
    // Some tests in the suite might've been already reported.
    if (!(0, _utils.isTestReported)(test)) {
      reportTestsSkippedByHookError(test, test.pending ? _objectSpread(_objectSpread({}, (0, _utils.getTestSkipData)()), {}, {
        status: _allureJsCommons.Status.SKIPPED
      }) : testFailData);
    }
  }
};
var reportTestsSkippedByHookError = (test, testFailData) => {
  (0, _state.enqueueRuntimeMessage)({
    type: "cypress_skipped_test",
    data: _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, (0, _utils.getTestStartData)(test)), testFailData), (0, _utils.getTestStopData)(test)), {}, {
      suites: (0, _utils.getSuitePath)(test).map(s => s.id)
    })
  });
  (0, _utils.markTestAsReported)(test);
};
var logAllureRootAfterError = (context, err) => {
  // We play safe and swallow errors here to keep the original 'after all' error.
  try {
    var _context$test$title, _context$test;
    // eslint-disable-next-line no-console
    console.error("Unexpected error when reporting the failure of ".concat((_context$test$title = (_context$test = context.test) === null || _context$test === void 0 ? void 0 : _context$test.title) !== null && _context$test$title !== void 0 ? _context$test$title : "'after all'"));
    // eslint-disable-next-line no-console
    console.error(err);
  } catch (_unused) {}
};
//# sourceMappingURL=lifecycle.js.map