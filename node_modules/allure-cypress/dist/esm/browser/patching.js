import { isPromise } from "allure-js-commons/sdk";
import { completeSpecIfNoAfterHookLeft, completeSpecOnAfterHookFailure, throwAfterSpecCompletion } from "./lifecycle.js";
/**
 * Patches the `after` function, to inject reporting of spec-level
 * `after` hooks defined by the user.
 */
export var enableScopeLevelAfterHookReporting = () => {
  var suiteDepthCounter = createSuiteDepthCounterState();
  patchDescribe(suiteDepthCounter);
  patchAfter(suiteDepthCounter);
};
var createSuiteDepthCounterState = () => {
  var suiteDepth = 0;
  return {
    getSuiteDepth: () => suiteDepth,
    incrementSuiteDepth: () => {
      suiteDepth++;
    },
    decrementSuiteDepth: () => {
      suiteDepth--;
    }
  };
};
var patchDescribe = _ref => {
  var {
    incrementSuiteDepth,
    decrementSuiteDepth
  } = _ref;
  var patchDescribeFn = target => (title, configOrFn, fn) => {
    incrementSuiteDepth();
    try {
      return forwardDescribeCall(target, title, configOrFn, fn);
    } finally {
      decrementSuiteDepth();
    }
  };
  var originalDescribeFn = globalThis.describe;
  var patchedDescribe = patchDescribeFn(originalDescribeFn);
  patchedDescribe.only = patchDescribeFn(originalDescribeFn.only);
  patchedDescribe.skip = patchDescribeFn(originalDescribeFn.skip);
  globalThis.describe = patchedDescribe;
};
var patchAfter = _ref2 => {
  var {
    getSuiteDepth
  } = _ref2;
  var originalAfter = globalThis.after;
  var patchedAfter = (nameOrFn, fn) => {
    return typeof nameOrFn === "string" ? originalAfter(nameOrFn, wrapRootAfterFn(getSuiteDepth, fn)) : originalAfter(wrapRootAfterFn(getSuiteDepth, nameOrFn));
  };
  globalThis.after = patchedAfter;
};
var forwardDescribeCall = function forwardDescribeCall(target) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }
  var [title, configOrFn, fn] = args;
  if (typeof fn === "undefined" && typeof configOrFn === "undefined") {
    return target(title);
  } else if (typeof configOrFn === "function") {
    return target(title, configOrFn);
  } else {
    return target(title, configOrFn, fn);
  }
};
var wrapRootAfterFn = (getSuiteDepth, fn) => {
  if (getSuiteDepth() === 0 && fn) {
    var wrappedFn = fn.length ? wrapAfterFnWithCallback(fn) : wrapAfterFnWithoutArgs(fn);
    Object.defineProperty(wrappedFn, "name", {
      value: fn.name
    });
    return wrappedFn;
  }
  return fn;
};
var wrapAfterFnWithCallback = fn => {
  return function (done) {
    var wrappedDone = hookError => {
      if (hookError) {
        var _completeSpecOnAfterH;
        if (!((_completeSpecOnAfterH = completeSpecOnAfterHookFailure(this, hookError)) !== null && _completeSpecOnAfterH !== void 0 && _completeSpecOnAfterH.then(() => done(hookError)))) {
          done(hookError);
        }
        return;
      }
      try {
        var _completeSpecIfNoAfte;
        if ((_completeSpecIfNoAfte = completeSpecIfNoAfterHookLeft(this)) !== null && _completeSpecIfNoAfte !== void 0 && _completeSpecIfNoAfte.then(() => done())) {
          return;
        }
      } catch (allureError) {
        done(allureError);
        return;
      }
      done();
    };
    return fn.bind(this)(wrappedDone);
  };
};
var wrapAfterFnWithoutArgs = fn => {
  return function () {
    var result;
    var syncError;
    try {
      result = fn.bind(this)();
    } catch (e) {
      syncError = e;
    }
    if (syncError) {
      throwAfterSpecCompletion(this, syncError);
    } else if (isPromise(result)) {
      return result.then(() => completeSpecIfNoAfterHookLeft(this), asyncError => throwAfterSpecCompletion(this, asyncError));
    } else {
      completeSpecIfNoAfterHookLeft(this);
      return result;
    }
  };
};
//# sourceMappingURL=patching.js.map