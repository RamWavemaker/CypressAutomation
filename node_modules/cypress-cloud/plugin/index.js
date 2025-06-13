"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// plugin/index.ts
var plugin_exports = {};
__export(plugin_exports, {
  cloudPlugin: () => cloudPlugin,
  default: () => plugin_default
});
module.exports = __toCommonJS(plugin_exports);
var import_debug = __toESM(require("debug"));
var import_fs = __toESM(require("fs"));
var import_util2 = require("util");
var import_ws = __toESM(require("ws"));

// lib/log.ts
var import_chalk = __toESM(require("chalk"));
var import_util = __toESM(require("util"));
var log = (...args) => console.log(import_util.default.format(...args));
var format = import_util.default.format;
var withWarning = (msg) => import_chalk.default.bgYellow.black(" WARNING ") + " " + msg;
var warn = (...args) => log(withWarning(import_util.default.format(...args)));
var cyan = import_chalk.default.cyan;
var blue = import_chalk.default.blueBright;
var red = import_chalk.default.red;
var green = import_chalk.default.greenBright;
var gray = import_chalk.default.gray;
var white = import_chalk.default.white;
var magenta = import_chalk.default.magenta;
var bold = import_chalk.default.bold;
var dim = import_chalk.default.dim;

// lib/pubsub/events.ts
var Event = /* @__PURE__ */ ((Event2) => {
  Event2["RUN_CANCELLED"] = "run:cancelled";
  Event2["RUN_RESULT"] = "run:result";
  Event2["TEST_AFTER_RUN"] = "test:after:run";
  Event2["TEST_BEFORE_RUN"] = "test:before:run";
  Event2["AFTER_SCREENSHOT"] = "after:screenshot";
  Event2["AFTER_SPEC"] = "after:spec";
  return Event2;
})(Event || {});
var allEvents = Object.values(Event);

// lib/pubsub/pubsub.ts
var import_events = __toESM(require("events"));

// plugin/index.ts
var _debug = (0, import_debug.default)("currents:plugin");
async function cloudPlugin(on, config) {
  function debug(...args) {
    if (config.env.currents_debug_enabled) {
      _debug((0, import_util2.format)(...args));
    }
  }
  if (!config.env.currents_marker) {
    warn(
      `Currents plugin is not installed properly - missing required variables in ${dim(
        "cypress.env"
      )}. Please refer to: https://github.com/currents-dev/cypress-cloud#setup-with-existing-plugins`
    );
  }
  let ws = null;
  function sendToWS(message) {
    if (ws) {
      ws.send(JSON.stringify(message));
    }
  }
  if (config.env.currents_ws) {
    debug("setting port to %s", config.env.currents_ws);
    await new Promise((resolve) => {
      ws = new import_ws.default(`ws://localhost:${config.env.currents_ws}`);
      ws.on("open", () => {
        resolve(null);
      });
    });
  }
  on("after:screenshot", (details) => {
    sendToWS({
      type: "after:screenshot" /* AFTER_SCREENSHOT */,
      payload: details
    });
  });
  on("task", {
    "currents:test:after:run": (test) => {
      debug("currents:test:after:run task received %o", test);
      sendToWS({
        type: "test:after:run" /* TEST_AFTER_RUN */,
        payload: test
      });
      return null;
    },
    "currents:test:before:run": (test) => {
      debug("currents:test:before:run task received %o", test);
      sendToWS({
        type: "test:before:run" /* TEST_BEFORE_RUN */,
        payload: test
      });
      return null;
    }
  });
  on("before:spec", (spec) => {
    debug("before:spec task received %o", spec);
    sendToWS({ type: "before:spec", payload: { spec } });
  });
  on("after:spec", (spec, results) => {
    debug("after:spec task received %o", spec);
    sendToWS({
      type: "after:spec" /* AFTER_SPEC */,
      payload: {
        spec,
        results
      }
    });
  });
  debug("currents plugin loaded");
  if (config.env.currents_temp_file) {
    debug("dumping config to '%s'", config.env.currents_temp_file);
    import_fs.default.writeFileSync(config.env.currents_temp_file, JSON.stringify(config));
    debug("config is availabe at '%s'", config.env.currents_temp_file);
  }
  return config;
}
var plugin_default = cloudPlugin;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cloudPlugin
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vcGx1Z2luL2luZGV4LnRzIiwgIi4uLy4uL2xpYi9sb2cudHMiLCAiLi4vLi4vbGliL3B1YnN1Yi9ldmVudHMudHMiLCAiLi4vLi4vbGliL3B1YnN1Yi9wdWJzdWIudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwiQ3lwcmVzc1wiIC8+XG5cbmltcG9ydCBEZWJ1ZyBmcm9tIFwiZGVidWdcIjtcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCB7IGZvcm1hdCB9IGZyb20gXCJ1dGlsXCI7XG5pbXBvcnQgV2ViU29ja2V0IGZyb20gXCJ3c1wiO1xuaW1wb3J0IHsgZGltLCB3YXJuIH0gZnJvbSBcIi4uL2xpYi9sb2dcIjtcbmltcG9ydCB7IEV2ZW50IH0gZnJvbSBcIi4uL2xpYi9wdWJzdWJcIjtcblxuY29uc3QgX2RlYnVnID0gRGVidWcoXCJjdXJyZW50czpwbHVnaW5cIik7XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvdWRQbHVnaW4oXG4gIG9uOiBDeXByZXNzLlBsdWdpbkV2ZW50cyxcbiAgY29uZmlnOiBDeXByZXNzLlBsdWdpbkNvbmZpZ09wdGlvbnNcbikge1xuICBmdW5jdGlvbiBkZWJ1ZyguLi5hcmdzOiB1bmtub3duW10pIHtcbiAgICBpZiAoY29uZmlnLmVudi5jdXJyZW50c19kZWJ1Z19lbmFibGVkKSB7XG4gICAgICBfZGVidWcoZm9ybWF0KC4uLmFyZ3MpKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbmZpZy5lbnYuY3VycmVudHNfbWFya2VyKSB7XG4gICAgd2FybihcbiAgICAgIGBDdXJyZW50cyBwbHVnaW4gaXMgbm90IGluc3RhbGxlZCBwcm9wZXJseSAtIG1pc3NpbmcgcmVxdWlyZWQgdmFyaWFibGVzIGluICR7ZGltKFxuICAgICAgICBcImN5cHJlc3MuZW52XCJcbiAgICAgICl9LiBQbGVhc2UgcmVmZXIgdG86IGh0dHBzOi8vZ2l0aHViLmNvbS9jdXJyZW50cy1kZXYvY3lwcmVzcy1jbG91ZCNzZXR1cC13aXRoLWV4aXN0aW5nLXBsdWdpbnNgXG4gICAgKTtcbiAgfVxuXG4gIGxldCB3czogV2ViU29ja2V0IHwgbnVsbCA9IG51bGw7XG4gIGZ1bmN0aW9uIHNlbmRUb1dTKG1lc3NhZ2U6IHVua25vd24pIHtcbiAgICBpZiAod3MpIHtcbiAgICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb25maWcuZW52LmN1cnJlbnRzX3dzKSB7XG4gICAgZGVidWcoXCJzZXR0aW5nIHBvcnQgdG8gJXNcIiwgY29uZmlnLmVudi5jdXJyZW50c193cyk7XG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIHdzID0gbmV3IFdlYlNvY2tldChgd3M6Ly9sb2NhbGhvc3Q6JHtjb25maWcuZW52LmN1cnJlbnRzX3dzfWApO1xuICAgICAgd3Mub24oXCJvcGVuXCIsICgpID0+IHtcbiAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgb24oXCJhZnRlcjpzY3JlZW5zaG90XCIsIChkZXRhaWxzKSA9PiB7XG4gICAgc2VuZFRvV1Moe1xuICAgICAgdHlwZTogRXZlbnQuQUZURVJfU0NSRUVOU0hPVCxcbiAgICAgIHBheWxvYWQ6IGRldGFpbHMsXG4gICAgfSk7XG4gIH0pO1xuXG4gIG9uKFwidGFza1wiLCB7XG4gICAgXCJjdXJyZW50czp0ZXN0OmFmdGVyOnJ1blwiOiAodGVzdCkgPT4ge1xuICAgICAgZGVidWcoXCJjdXJyZW50czp0ZXN0OmFmdGVyOnJ1biB0YXNrIHJlY2VpdmVkICVvXCIsIHRlc3QpO1xuICAgICAgc2VuZFRvV1Moe1xuICAgICAgICB0eXBlOiBFdmVudC5URVNUX0FGVEVSX1JVTixcbiAgICAgICAgcGF5bG9hZDogdGVzdCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBcImN1cnJlbnRzOnRlc3Q6YmVmb3JlOnJ1blwiOiAodGVzdCkgPT4ge1xuICAgICAgZGVidWcoXCJjdXJyZW50czp0ZXN0OmJlZm9yZTpydW4gdGFzayByZWNlaXZlZCAlb1wiLCB0ZXN0KTtcbiAgICAgIHNlbmRUb1dTKHtcbiAgICAgICAgdHlwZTogRXZlbnQuVEVTVF9CRUZPUkVfUlVOLFxuICAgICAgICBwYXlsb2FkOiB0ZXN0LFxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICB9KTtcblxuICBvbihcImJlZm9yZTpzcGVjXCIsIChzcGVjKSA9PiB7XG4gICAgZGVidWcoXCJiZWZvcmU6c3BlYyB0YXNrIHJlY2VpdmVkICVvXCIsIHNwZWMpO1xuICAgIHNlbmRUb1dTKHsgdHlwZTogXCJiZWZvcmU6c3BlY1wiLCBwYXlsb2FkOiB7IHNwZWMgfSB9KTtcbiAgfSk7XG5cbiAgb24oXCJhZnRlcjpzcGVjXCIsIChzcGVjLCByZXN1bHRzKSA9PiB7XG4gICAgZGVidWcoXCJhZnRlcjpzcGVjIHRhc2sgcmVjZWl2ZWQgJW9cIiwgc3BlYyk7XG4gICAgc2VuZFRvV1Moe1xuICAgICAgdHlwZTogRXZlbnQuQUZURVJfU1BFQyxcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgc3BlYyxcbiAgICAgICAgcmVzdWx0cyxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlYnVnKFwiY3VycmVudHMgcGx1Z2luIGxvYWRlZFwiKTtcblxuICBpZiAoY29uZmlnLmVudi5jdXJyZW50c190ZW1wX2ZpbGUpIHtcbiAgICBkZWJ1ZyhcImR1bXBpbmcgY29uZmlnIHRvICclcydcIiwgY29uZmlnLmVudi5jdXJyZW50c190ZW1wX2ZpbGUpO1xuICAgIGZzLndyaXRlRmlsZVN5bmMoY29uZmlnLmVudi5jdXJyZW50c190ZW1wX2ZpbGUsIEpTT04uc3RyaW5naWZ5KGNvbmZpZykpO1xuICAgIGRlYnVnKFwiY29uZmlnIGlzIGF2YWlsYWJlIGF0ICclcydcIiwgY29uZmlnLmVudi5jdXJyZW50c190ZW1wX2ZpbGUpO1xuICB9XG5cbiAgcmV0dXJuIGNvbmZpZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xvdWRQbHVnaW47XG4iLCAiaW1wb3J0IGNoYWxrIGZyb20gXCJjaGFsa1wiO1xuaW1wb3J0IHV0aWwgZnJvbSBcInV0aWxcIjtcblxuY29uc3QgbG9nID0gKC4uLmFyZ3M6IHVua25vd25bXSkgPT4gY29uc29sZS5sb2codXRpbC5mb3JtYXQoLi4uYXJncykpO1xuXG5leHBvcnQgY29uc3QgaW5mbyA9IGxvZztcblxuZXhwb3J0IGNvbnN0IGZvcm1hdCA9IHV0aWwuZm9ybWF0O1xuZXhwb3J0IGNvbnN0IHdpdGhFcnJvciA9IChtc2c6IHN0cmluZykgPT5cbiAgY2hhbGsuYmdSZWQud2hpdGUoXCIgRVJST1IgXCIpICsgXCIgXCIgKyBtc2c7XG5leHBvcnQgY29uc3Qgd2l0aFdhcm5pbmcgPSAobXNnOiBzdHJpbmcpID0+XG4gIGNoYWxrLmJnWWVsbG93LmJsYWNrKFwiIFdBUk5JTkcgXCIpICsgXCIgXCIgKyBtc2c7XG5cbmV4cG9ydCBjb25zdCB3YXJuID0gKC4uLmFyZ3M6IHVua25vd25bXSkgPT5cbiAgbG9nKHdpdGhXYXJuaW5nKHV0aWwuZm9ybWF0KC4uLmFyZ3MpKSk7XG5cbmV4cG9ydCBjb25zdCBzdWNjZXNzID0gKC4uLmFyZ3M6IHVua25vd25bXSkgPT5cbiAgbG9nKGNoYWxrLmdyZWVuKHV0aWwuZm9ybWF0KC4uLmFyZ3MpKSk7XG5cbmV4cG9ydCBjb25zdCBlcnJvciA9ICguLi5hcmdzOiB1bmtub3duW10pID0+XG4gIGxvZyh3aXRoRXJyb3IodXRpbC5mb3JtYXQoLi4uYXJncykpICsgXCJcXG5cIik7XG5cbnR5cGUgQ29sb3IgPSBcInJlZFwiIHwgXCJncmVlblwiIHwgXCJ5ZWxsb3dcIiB8IFwiYmx1ZVwiIHwgXCJtYWdlbnRhXCIgfCBcImN5YW5cIiB8IFwid2hpdGVcIjtcbmV4cG9ydCBjb25zdCB0aXRsZSA9IChjb2xvcjogQ29sb3IsIC4uLmFyZ3M6IHVua25vd25bXSkgPT5cbiAgaW5mbyhcIlxcblwiICsgXCIgIFwiICsgY2hhbGtbY29sb3JdLmJvbGQodXRpbC5mb3JtYXQoLi4uYXJncykpICsgXCIgIFwiICsgXCJcXG5cIik7XG5cbmV4cG9ydCBjb25zdCBkaXZpZGVyID0gKCkgPT5cbiAgY29uc29sZS5sb2coXCJcXG5cIiArIGNoYWxrLmdyYXkoQXJyYXkoMTAwKS5maWxsKFwiPVwiKS5qb2luKFwiXCIpKSArIFwiXFxuXCIpO1xuXG5leHBvcnQgY29uc3Qgc3BhY2VyID0gKG46IG51bWJlciA9IDApID0+XG4gIGNvbnNvbGUubG9nKEFycmF5KG4pLmZpbGwoXCJcIikuam9pbihcIlxcblwiKSk7XG5cbmV4cG9ydCBjb25zdCBjeWFuID0gY2hhbGsuY3lhbjtcbmV4cG9ydCBjb25zdCBibHVlID0gY2hhbGsuYmx1ZUJyaWdodDtcbmV4cG9ydCBjb25zdCByZWQgPSBjaGFsay5yZWQ7XG5leHBvcnQgY29uc3QgZ3JlZW4gPSBjaGFsay5ncmVlbkJyaWdodDtcbmV4cG9ydCBjb25zdCBncmF5ID0gY2hhbGsuZ3JheTtcbmV4cG9ydCBjb25zdCB3aGl0ZSA9IGNoYWxrLndoaXRlO1xuZXhwb3J0IGNvbnN0IG1hZ2VudGEgPSBjaGFsay5tYWdlbnRhO1xuZXhwb3J0IGNvbnN0IGJvbGQgPSBjaGFsay5ib2xkO1xuZXhwb3J0IGNvbnN0IGRpbSA9IGNoYWxrLmRpbTtcbiIsICJleHBvcnQgZW51bSBFdmVudCB7XG4gIFJVTl9DQU5DRUxMRUQgPSBcInJ1bjpjYW5jZWxsZWRcIixcbiAgUlVOX1JFU1VMVCA9IFwicnVuOnJlc3VsdFwiLFxuICBURVNUX0FGVEVSX1JVTiA9IFwidGVzdDphZnRlcjpydW5cIixcbiAgVEVTVF9CRUZPUkVfUlVOID0gXCJ0ZXN0OmJlZm9yZTpydW5cIixcbiAgQUZURVJfU0NSRUVOU0hPVCA9IFwiYWZ0ZXI6c2NyZWVuc2hvdFwiLFxuICBBRlRFUl9TUEVDID0gXCJhZnRlcjpzcGVjXCIsXG59XG5leHBvcnQgY29uc3QgYWxsRXZlbnRzID0gT2JqZWN0LnZhbHVlcyhFdmVudCk7XG4iLCAiaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwiZXZlbnRzXCI7XG5cbmxldCBfcHVic3ViOiBFdmVudEVtaXR0ZXIgfCBudWxsID0gbnVsbDtcbmV4cG9ydCBjb25zdCBnZXRQdWJTdWIgPSAoKSA9PiB7XG4gIGlmICghX3B1YnN1Yikge1xuICAgIF9wdWJzdWIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIH1cbiAgcmV0dXJuIF9wdWJzdWI7XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBRUEsbUJBQWtCO0FBQ2xCLGdCQUFlO0FBQ2YsSUFBQUEsZUFBdUI7QUFDdkIsZ0JBQXNCOzs7QUNMdEIsbUJBQWtCO0FBQ2xCLGtCQUFpQjtBQUVqQixJQUFNLE1BQU0sSUFBSSxTQUFvQixRQUFRLElBQUksWUFBQUMsUUFBSyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBSTdELElBQU0sU0FBUyxZQUFBQyxRQUFLO0FBR3BCLElBQU0sY0FBYyxDQUFDLFFBQzFCLGFBQUFDLFFBQU0sU0FBUyxNQUFNLFdBQVcsSUFBSSxNQUFNO0FBRXJDLElBQU0sT0FBTyxJQUFJLFNBQ3RCLElBQUksWUFBWSxZQUFBQyxRQUFLLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQztBQWtCaEMsSUFBTSxPQUFPLGFBQUFDLFFBQU07QUFDbkIsSUFBTSxPQUFPLGFBQUFBLFFBQU07QUFDbkIsSUFBTSxNQUFNLGFBQUFBLFFBQU07QUFDbEIsSUFBTSxRQUFRLGFBQUFBLFFBQU07QUFDcEIsSUFBTSxPQUFPLGFBQUFBLFFBQU07QUFDbkIsSUFBTSxRQUFRLGFBQUFBLFFBQU07QUFDcEIsSUFBTSxVQUFVLGFBQUFBLFFBQU07QUFDdEIsSUFBTSxPQUFPLGFBQUFBLFFBQU07QUFDbkIsSUFBTSxNQUFNLGFBQUFBLFFBQU07OztBQ3hDbEIsSUFBSyxRQUFMLGtCQUFLQyxXQUFMO0FBQ0wsRUFBQUEsT0FBQSxtQkFBZ0I7QUFDaEIsRUFBQUEsT0FBQSxnQkFBYTtBQUNiLEVBQUFBLE9BQUEsb0JBQWlCO0FBQ2pCLEVBQUFBLE9BQUEscUJBQWtCO0FBQ2xCLEVBQUFBLE9BQUEsc0JBQW1CO0FBQ25CLEVBQUFBLE9BQUEsZ0JBQWE7QUFOSCxTQUFBQTtBQUFBLEdBQUE7QUFRTCxJQUFNLFlBQVksT0FBTyxPQUFPLEtBQUs7OztBQ1I1QyxvQkFBeUI7OztBSFN6QixJQUFNLGFBQVMsYUFBQUMsU0FBTSxpQkFBaUI7QUFDdEMsZUFBc0IsWUFDcEIsSUFDQSxRQUNBO0FBQ0EsV0FBUyxTQUFTLE1BQWlCO0FBQ2pDLFFBQUksT0FBTyxJQUFJLHdCQUF3QjtBQUNyQyxpQkFBTyxxQkFBTyxHQUFHLElBQUksQ0FBQztBQUFBLElBQ3hCO0FBQUEsRUFDRjtBQUVBLE1BQUksQ0FBQyxPQUFPLElBQUksaUJBQWlCO0FBQy9CO0FBQUEsTUFDRSw2RUFBNkU7QUFBQSxRQUMzRTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUVBLE1BQUksS0FBdUI7QUFDM0IsV0FBUyxTQUFTLFNBQWtCO0FBQ2xDLFFBQUksSUFBSTtBQUNOLFNBQUcsS0FBSyxLQUFLLFVBQVUsT0FBTyxDQUFDO0FBQUEsSUFDakM7QUFBQSxFQUNGO0FBRUEsTUFBSSxPQUFPLElBQUksYUFBYTtBQUMxQixVQUFNLHNCQUFzQixPQUFPLElBQUksV0FBVztBQUNsRCxVQUFNLElBQUksUUFBUSxDQUFDLFlBQVk7QUFDN0IsV0FBSyxJQUFJLFVBQUFDLFFBQVUsa0JBQWtCLE9BQU8sSUFBSSxhQUFhO0FBQzdELFNBQUcsR0FBRyxRQUFRLE1BQU07QUFDbEIsZ0JBQVEsSUFBSTtBQUFBLE1BQ2QsQ0FBQztBQUFBLElBQ0gsQ0FBQztBQUFBLEVBQ0g7QUFFQSxLQUFHLG9CQUFvQixDQUFDLFlBQVk7QUFDbEMsYUFBUztBQUFBLE1BQ1A7QUFBQSxNQUNBLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNILENBQUM7QUFFRCxLQUFHLFFBQVE7QUFBQSxJQUNULDJCQUEyQixDQUFDLFNBQVM7QUFDbkMsWUFBTSw0Q0FBNEMsSUFBSTtBQUN0RCxlQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0EsU0FBUztBQUFBLE1BQ1gsQ0FBQztBQUNELGFBQU87QUFBQSxJQUNUO0FBQUEsSUFDQSw0QkFBNEIsQ0FBQyxTQUFTO0FBQ3BDLFlBQU0sNkNBQTZDLElBQUk7QUFDdkQsZUFBUztBQUFBLFFBQ1A7QUFBQSxRQUNBLFNBQVM7QUFBQSxNQUNYLENBQUM7QUFDRCxhQUFPO0FBQUEsSUFDVDtBQUFBLEVBQ0YsQ0FBQztBQUVELEtBQUcsZUFBZSxDQUFDLFNBQVM7QUFDMUIsVUFBTSxnQ0FBZ0MsSUFBSTtBQUMxQyxhQUFTLEVBQUUsTUFBTSxlQUFlLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUFBLEVBQ3JELENBQUM7QUFFRCxLQUFHLGNBQWMsQ0FBQyxNQUFNLFlBQVk7QUFDbEMsVUFBTSwrQkFBK0IsSUFBSTtBQUN6QyxhQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0gsQ0FBQztBQUVELFFBQU0sd0JBQXdCO0FBRTlCLE1BQUksT0FBTyxJQUFJLG9CQUFvQjtBQUNqQyxVQUFNLDBCQUEwQixPQUFPLElBQUksa0JBQWtCO0FBQzdELGNBQUFDLFFBQUcsY0FBYyxPQUFPLElBQUksb0JBQW9CLEtBQUssVUFBVSxNQUFNLENBQUM7QUFDdEUsVUFBTSw4QkFBOEIsT0FBTyxJQUFJLGtCQUFrQjtBQUFBLEVBQ25FO0FBRUEsU0FBTztBQUNUO0FBRUEsSUFBTyxpQkFBUTsiLAogICJuYW1lcyI6IFsiaW1wb3J0X3V0aWwiLCAidXRpbCIsICJ1dGlsIiwgImNoYWxrIiwgInV0aWwiLCAiY2hhbGsiLCAiRXZlbnQiLCAiRGVidWciLCAiV2ViU29ja2V0IiwgImZzIl0KfQo=