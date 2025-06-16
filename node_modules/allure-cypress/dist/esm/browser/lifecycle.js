function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { ContentType, Status } from "allure-js-commons";
import { getMessageAndTraceFromError, getStatusFromError } from "allure-js-commons/sdk";
import { getTestRuntime } from "./runtime.js";
import { dropCurrentTest, enqueueRuntimeMessage, getCurrentTest, setCurrentTest } from "./state.js";
import { finalizeSteps, stopAllSteps } from "./steps.js";
import { getStatusDataOfTestSkippedByHookError, getStepStopData, getSuitePath, getTestSkipData, getTestStartData, getTestStopData, isAllureHook, isLastRootAfterHook, isTestReported, iterateTests, markTestAsReported } from "./utils.js";
export var reportRunStart = () => {
  enqueueRuntimeMessage({
    type: "cypress_run_start",
    data: {}
  });
};
export var reportSuiteStart = suite => {
  enqueueRuntimeMessage({
    type: "cypress_suite_start",
    data: {
      id: suite.id,
      name: suite.title,
      root: suite.root,
      start: Date.now()
    }
  });
};
export var reportSuiteEnd = suite => {
  enqueueRuntimeMessage({
    type: "cypress_suite_end",
    data: {
      root: suite.root,
      stop: Date.now()
    }
  });
};
export var reportHookStart = (hook, start) => {
  enqueueRuntimeMessage({
    type: "cypress_hook_start",
    data: {
      name: hook.title,
      scopeType: hook.hookName.includes("each") ? "each" : "all",
      position: hook.hookName.includes("before") ? "before" : "after",
      start: start !== null && start !== void 0 ? start : Date.now()
    }
  });
};
export var reportHookEnd = hook => {
  var _hook$duration;
  finalizeSteps();
  enqueueRuntimeMessage({
    type: "cypress_hook_end",
    data: {
      duration: (_hook$duration = hook.duration) !== null && _hook$duration !== void 0 ? _hook$duration : 0
    }
  });
};
export var reportTestStart = test => {
  setCurrentTest(test);
  enqueueRuntimeMessage({
    type: "cypress_test_start",
    data: getTestStartData(test)
  });
  markTestAsReported(test);
};
export var reportStepStart = (id, name) => {
  enqueueRuntimeMessage({
    type: "cypress_step_start",
    data: {
      id,
      name,
      start: Date.now()
    }
  });
};
export var reportStepStop = (step, status, statusDetails) => {
  enqueueRuntimeMessage({
    type: "cypress_step_stop",
    data: getStepStopData(step, status, statusDetails)
  });
};
export var reportTestPass = () => {
  enqueueRuntimeMessage({
    type: "cypress_test_pass",
    data: {}
  });
};
export var reportTestOrHookFail = err => {
  var status = getStatusFromError(err);
  var statusDetails = getMessageAndTraceFromError(err);
  stopAllSteps(status, statusDetails);
  enqueueRuntimeMessage({
    type: "cypress_fail",
    data: {
      status,
      statusDetails
    }
  });
};
export var completeHookErrorReporting = (hook, err) => {
  var isEachHook = hook.hookName.includes("each");
  var suite = hook.parent;
  var testFailData = getStatusDataOfTestSkippedByHookError(hook.title, isEachHook, err, suite);

  // Cypress doens't emit 'hook end' if the hook has failed.
  reportHookEnd(hook);

  // Cypress doens't emit 'test end' if the hook has failed.
  // We must report the test's end manualy in case of a 'before each' hook.
  reportCurrentTestIfAny();

  // Cypress skips the remaining tests in the suite of a failed hook.
  // We should include them to the report manually.
  reportRemainingTests(suite, testFailData);
};
export var reportTestSkip = test => {
  if (isTestReported(test)) {
    stopAllSteps(Status.SKIPPED, {
      message: "The test was skipped before the command was completed"
    });
  } else {
    reportTestStart(test);
  }
  enqueueRuntimeMessage({
    type: "cypress_test_skip",
    data: getTestSkipData()
  });
};
export var reportTestEnd = test => {
  var _test$duration, _retries;
  finalizeSteps();
  enqueueRuntimeMessage({
    type: "cypress_test_end",
    data: {
      duration: (_test$duration = test.duration) !== null && _test$duration !== void 0 ? _test$duration : 0,
      retries: (_retries = test._retries) !== null && _retries !== void 0 ? _retries : 0
    }
  });
  dropCurrentTest();
};
export var reportScreenshot = (path, name) => {
  enqueueRuntimeMessage({
    type: "attachment_path",
    data: {
      path,
      name,
      contentType: ContentType.PNG
    }
  });
};
export var completeSpecIfNoAfterHookLeft = context => {
  if (isLastRootAfterHook(context)) {
    var hook = context.test;
    if (!isAllureHook(hook)) {
      reportHookEnd(hook);
    }
    return completeSpecAsync();
  }
};
export var completeSpecOnAfterHookFailure = (context, hookError) => {
  try {
    reportTestOrHookFail(hookError);
    completeHookErrorReporting(context.test, hookError);

    // cy.task's then doesn't have onrejected, that's why we don't log async Allure errors here.
    return completeSpecAsync();
  } catch (allureError) {
    logAllureRootAfterError(context, allureError);
  }
};
export var throwAfterSpecCompletion = (context, err) => {
  var _completeSpecOnAfterH;
  var chain = (_completeSpecOnAfterH = completeSpecOnAfterHookFailure(context, err)) === null || _completeSpecOnAfterH === void 0 ? void 0 : _completeSpecOnAfterH.then(() => {
    throw err;
  });
  if (!chain) {
    throw err;
  }
};
export var flushRuntimeMessages = () => getTestRuntime().flushAllureMessagesToTask("reportAllureCypressSpecMessages");
export var completeSpecAsync = () => getTestRuntime().flushAllureMessagesToTaskAsync("reportFinalAllureCypressSpecMessages");
var reportCurrentTestIfAny = () => {
  var currentTest = getCurrentTest();
  if (currentTest) {
    reportTestEnd(currentTest);
  }
};
var reportRemainingTests = (suite, testFailData) => {
  for (var test of iterateTests(suite)) {
    // Some tests in the suite might've been already reported.
    if (!isTestReported(test)) {
      reportTestsSkippedByHookError(test, test.pending ? _objectSpread(_objectSpread({}, getTestSkipData()), {}, {
        status: Status.SKIPPED
      }) : testFailData);
    }
  }
};
var reportTestsSkippedByHookError = (test, testFailData) => {
  enqueueRuntimeMessage({
    type: "cypress_skipped_test",
    data: _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, getTestStartData(test)), testFailData), getTestStopData(test)), {}, {
      suites: getSuitePath(test).map(s => s.id)
    })
  });
  markTestAsReported(test);
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