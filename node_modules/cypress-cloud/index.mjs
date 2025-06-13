// index.ts
import "source-map-support/register.js";

// lib/require.ts
import { createRequire } from "module";
var require2 = createRequire(import.meta.url);

// lib/stdout.ts
import cp from "child_process";
var orginal = cp.spawn;
cp.spawn = function(command, args, options) {
  if (command.match(/Cypress/)) {
    const process2 = orginal(command, args, {
      ...options,
      // using pipe enables capturing stdout and stderr
      stdio: ["pipe", "pipe", "pipe"]
    });
    return process2;
  }
  return orginal(command, args, options);
};

// lib/ws/ws.ts
import Debug from "debug";
import http from "http";
import HttpTerminator from "lil-http-terminator";
import { match, P } from "ts-pattern";
import * as WebSocket from "ws";

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
import EventEmitter from "events";
var _pubsub = null;
var getPubSub = () => {
  if (!_pubsub) {
    _pubsub = new EventEmitter();
  }
  return _pubsub;
};

// lib/ws/ws.ts
var debug = Debug("currents:ws");
var server = null;
var wss = null;
var httpTerminator = null;
var getWSSPort = () => match(server?.address()).with({ port: P.number }, (address) => address.port).otherwise(() => 0);
var stopWSS = async () => {
  debug("terminating wss server: %d", getWSSPort());
  if (!httpTerminator) {
    debug("no wss server");
    return;
  }
  const { success, code, message, error: error2 } = await httpTerminator.terminate();
  if (!success) {
    if (code === "TIMED_OUT")
      error2(message);
    if (code === "SERVER_ERROR")
      error2(message, error2);
    if (code === "INTERNAL_ERROR")
      error2(message, error2);
  }
  debug("terminated wss server: %d", getWSSPort());
};
var startWSS = () => {
  if (wss) {
    return;
  }
  server = http.createServer().on("listening", () => {
    if (!server) {
      throw new Error("Server not initialized");
    }
    wss = new WebSocket.WebSocketServer({
      server
    });
    debug("starting wss on port %d", getWSSPort());
    wss.on("connection", function connection(ws) {
      ws.on("message", function incoming(event) {
        const message = JSON.parse(event.toString());
        getPubSub().emit(message.type, message.payload);
      });
    });
  }).listen();
  httpTerminator = HttpTerminator({
    server
  });
};

// lib/capture.ts
import Debug2 from "debug";
var debug2 = Debug2("currents:capture");
var _write = process.stdout.write;
var _log = process.log;
var restore = function() {
  process.stdout.write = _write;
  process.log = _log;
};
var stdout = function() {
  debug2("capturing stdout");
  let logs = [];
  const { write } = process.stdout;
  const { log: log2 } = process;
  if (log2) {
    process.log = function(str) {
      logs.push(str);
      return log2.apply(this, arguments);
    };
  }
  process.stdout.write = function(str) {
    logs.push(str);
    return write.apply(this, arguments);
  };
  return {
    toString() {
      return logs.join("");
    },
    data: logs,
    restore,
    reset: () => {
      debug2("resetting captured stdout");
      logs = [];
    }
  };
};
var initialOutput = "";
var capturedOutput = null;
var initCapture = () => capturedOutput = stdout();
var cutInitialOutput = () => {
  if (!capturedOutput)
    throw new Error("capturedOutput is null");
  initialOutput = capturedOutput.toString();
  capturedOutput.reset();
};
var resetCapture = () => {
  if (!capturedOutput)
    throw new Error("capturedOutput is null");
  capturedOutput.reset();
};
var getCapturedOutput = () => {
  if (!capturedOutput)
    throw new Error("capturedOutput is null");
  return capturedOutput.toString();
};
var getInitialOutput = () => initialOutput;

// lib/state/global.ts
var _runId = void 0;
var setRunId = (runId) => {
  _runId = runId;
};
var _cypressVersion = void 0;
var setCypressVersion = (cypressVersion) => {
  _cypressVersion = cypressVersion;
};
var _currentsVersion = void 0;
var setCurrentsVersion = (v) => {
  _currentsVersion = v;
};

// lib/init.ts
var cypressPkg = require2("cypress/package.json");
var pkg = require2("cypress-cloud/package.json");
initCapture();
setCypressVersion(cypressPkg.version);
setCurrentsVersion(pkg.version);

// lib/run.ts
import Debug21 from "debug";

// legal.ts
function getLegalNotice() {
  return `
Copyright (C) ${(/* @__PURE__ */ new Date()).getFullYear()} Currents Software Inc https://currents.dev
This is free software, and you are welcome to redistribute it under certain
conditions. This program comes with no warranty. Parts of this program are MIT
licensed. Refer to the license for details
https://github.com/currents-dev/cypress-cloud/blob/main/LICENSE.md
`;
}

// lib/httpClient/config.ts
import { isAxiosError } from "axios";
var isRetriableError = (err) => {
  if (err.code === "ECONNABORTED") {
    return true;
  }
  if (err.code === "ECONNREFUSED") {
    return true;
  }
  if (err.code === "ETIMEDOUT") {
    return true;
  }
  if (!isAxiosError(err)) {
    return false;
  }
  return !!(err?.response?.status && 500 <= err.response.status && err.response.status < 600);
};
var getDelay = (i) => [5 * 1e3, 10 * 1e3, 30 * 1e3][i - 1];
var baseURL = "https://cy.currents.dev";
var getAPIBaseUrl = () => baseURL ?? "https://cy.currents.dev";
var setAPIBaseUrl = (url) => baseURL = url ?? "https://cy.currents.dev";

// lib/httpClient/httpClient.ts
import axios from "axios";
import axiosRetry from "axios-retry";
import Debug7 from "debug";
import _5 from "lodash";
import prettyMilliseconds from "pretty-ms";

// lib/config/config.ts
import Debug5 from "debug";
import { P as P3, match as match3 } from "ts-pattern";

// lib/bootstrap/bootstrap.ts
import { getBinPath } from "cy2";
import Debug4 from "debug";
import execa from "execa";
import fs from "fs";

// lib/errors.ts
var ValidationError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "";
  }
};

// lib/fs.ts
import { file } from "tmp-promise";
var createTempFile = async () => {
  const { path: path5 } = await file();
  return path5;
};

// lib/log.ts
import chalk from "chalk";
import util from "util";
var log = (...args) => console.log(util.format(...args));
var info = log;
var format = util.format;
var withError = (msg) => chalk.bgRed.white(" ERROR ") + " " + msg;
var withWarning = (msg) => chalk.bgYellow.black(" WARNING ") + " " + msg;
var warn = (...args) => log(withWarning(util.format(...args)));
var error = (...args) => log(withError(util.format(...args)) + "\n");
var title = (color, ...args) => info("\n  " + chalk[color].bold(util.format(...args)) + "  \n");
var divider = () => console.log("\n" + chalk.gray(Array(100).fill("=").join("")) + "\n");
var spacer = (n = 0) => console.log(Array(n).fill("").join("\n"));
var cyan = chalk.cyan;
var blue = chalk.blueBright;
var red = chalk.red;
var green = chalk.greenBright;
var gray = chalk.gray;
var white = chalk.white;
var magenta = chalk.magenta;
var bold = chalk.bold;
var dim = chalk.dim;

// lib/bootstrap/serializer.ts
import Debug3 from "debug";
import _ from "lodash";

// lib/debug/index.ts
import debug3 from "debug";
import { match as match2, P as P2 } from "ts-pattern";
function shouldEnablePluginDebug(param) {
  return match2(param).with(P2.nullish, () => false).with("none" /* None */, () => false).with(true, () => true).with("all" /* All */, () => true).with("currents" /* Currents */, () => true).with(
    P2.array(P2.string),
    (v) => v.includes("all" /* All */) || v.includes("currents" /* Currents */)
  ).otherwise(() => false);
}
function activateDebug(mode) {
  match2(mode).with(P2.instanceOf(Array), (i) => i.forEach(setDebugMode)).with(true, () => setDebugMode("all" /* All */)).with(
    P2.union(
      "all" /* All */,
      "currents" /* Currents */,
      "cypress" /* Cypress */,
      "commit-info" /* CommitInfo */
    ),
    (i) => setDebugMode(i)
  ).otherwise(() => setDebugMode("none" /* None */));
}
function setDebugMode(mode) {
  if (mode === "none" /* None */) {
    return;
  }
  const tokens = new Set(process.env.DEBUG ? process.env.DEBUG.split(",") : []);
  match2(mode).with("all" /* All */, () => {
    tokens.add("commit-info" /* CommitInfo */);
    tokens.add("currents:*" /* Currents */);
    tokens.add("cypress:*" /* Cypress */);
  }).with("currents" /* Currents */, () => tokens.add("currents:*" /* Currents */)).with("cypress" /* Cypress */, () => tokens.add("cypress:*" /* Cypress */)).with("commit-info" /* CommitInfo */, () => tokens.add("commit-info" /* CommitInfo */)).otherwise(() => {
  });
  debug3.enable(Array.from(tokens).join(","));
}

// lib/lang.ts
import bluebird from "bluebird";
bluebird.Promise.config({
  cancellation: true
});
var BPromise = bluebird.Promise;
var safe = (fn, ifFaled, ifSucceed) => async (...args) => {
  try {
    const r = await fn(...args);
    ifSucceed();
    return r;
  } catch (e) {
    return ifFaled(e);
  }
};
var sortObjectKeys = (obj) => {
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {});
};

// lib/nano.ts
import { customAlphabet } from "nanoid";
var getRandomString = customAlphabet("abcdefghijklmnopqrstuvwxyz", 10);

// lib/bootstrap/serializer.ts
var debug4 = Debug3("currents:boot");
function getBootstrapArgs({
  params,
  tempFilePath
}) {
  return _.chain(getCypressCLIParams(params)).thru((opts) => ({
    ...opts,
    // merge the env with the currents specific env variables
    env: {
      ...opts.env ?? {},
      currents_marker: true,
      currents_temp_file: tempFilePath,
      currents_debug_enabled: shouldEnablePluginDebug(params.cloudDebug)
    }
  })).tap((opts) => {
    debug4("cypress bootstrap params: %o", opts);
  }).thru((opts) => ({
    ...opts,
    env: sortObjectKeys(opts.env ?? {})
  })).thru(serializeOptions).tap((opts) => {
    debug4("cypress bootstrap serialized params: %o", opts);
  }).thru((args) => {
    return [
      ...args,
      "--spec",
      getRandomString(),
      params.testingType === "component" ? "--component" : "--e2e"
    ];
  }).value();
}
function getCypressCLIParams(params) {
  const result = getCypressRunAPIParams(params);
  const testingType = result.testingType === "component" ? {
    component: true
  } : {};
  return {
    ..._.omit(result, "testingType"),
    ...testingType
  };
}
function serializeOptions(options) {
  return Object.entries(options).flatMap(([key, value]) => {
    const _key = dashed(key);
    if (typeof value === "boolean") {
      return value === true ? [`--${_key}`] : [`--${_key}`, false];
    }
    if (_.isObject(value)) {
      return [`--${_key}`, serializeComplexParam(value)];
    }
    return [`--${_key}`, value.toString()];
  });
}
function serializeComplexParam(param) {
  return JSON.stringify(param);
}
var dashed = (v) => v.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());

// lib/bootstrap/bootstrap.ts
var debug5 = Debug4("currents:boot");
var bootCypress = async (params) => {
  debug5("booting cypress...");
  const tempFilePath = await createTempFile();
  const cypressBin = await getBinPath(require2.resolve("cypress"));
  debug5("cypress executable location: %s", cypressBin);
  const args = getBootstrapArgs({ tempFilePath, params });
  debug5("booting cypress with args: %o", args);
  const { stdout: stdout2, stderr } = await execCypress(cypressBin, args);
  if (!fs.existsSync(tempFilePath)) {
    throw new Error(
      `Cannot resolve cypress configuration from ${tempFilePath}. Please report the issue.`
    );
  }
  try {
    const f = fs.readFileSync(tempFilePath, "utf-8");
    if (!f) {
      throw new Error("Is cypress-cloud/plugin installed?");
    }
    debug5("cypress config '%s': '%s'", tempFilePath, f);
    return JSON.parse(f);
  } catch (err) {
    debug5("read config temp file failed: %o", err);
    info(bold("Cypress stdout:\n"), stdout2);
    info(bold("Cypress stderr:\n"), stderr);
    throw new ValidationError(`Unable to resolve cypress configuration
- make sure that 'cypress-cloud/plugin' is installed
- report the issue together with cypress stdout and stderr
`);
  }
};
async function execCypress(cypressBin, args) {
  let stdout2 = "";
  let stderr = "";
  try {
    await execa(cypressBin, ["run", ...args], {
      stdio: "pipe",
      env: {
        ...process.env,
        // prevent warnings about recording mode
        CYPRESS_RECORD_KEY: void 0,
        CYPRESS_PROJECT_ID: void 0
      }
    });
  } catch (err) {
    debug5("exec cypress failed (certain failures are expected): %o", err);
    stdout2 = err.stdout;
    stderr = err.stderr;
  }
  return { stdout: stdout2, stderr };
}

// lib/config/path.ts
import isAbsolute from "is-absolute";
import _2 from "lodash";
import path from "path";
var defaultFilenames = [
  "currents.config.js",
  "currents.config.cjs",
  "currents.config.mjs"
];
function getConfigFilePath(projectRoot = null, explicitConfigFilePath) {
  const prefix = projectRoot ?? process.cwd();
  if (_2.isString(explicitConfigFilePath) && isAbsolute(explicitConfigFilePath)) {
    return [explicitConfigFilePath];
  }
  if (_2.isString(explicitConfigFilePath)) {
    return [normalizePath(prefix, explicitConfigFilePath)];
  }
  return defaultFilenames.map((p) => normalizePath(prefix, p));
}
function normalizePath(prefix, filename) {
  return `file://${path.resolve(prefix, filename)}`;
}

// lib/config/config.ts
var debug6 = Debug5("currents:config");
var _config = null;
var defaultConfig = {
  e2e: {
    batchSize: 3
  },
  component: {
    batchSize: 5
  },
  cloudServiceUrl: "https://cy.currents.dev",
  networkHeaders: void 0
};
async function getCurrentsConfig(projectRoot, explicitConfigFilePath) {
  if (_config) {
    return _config;
  }
  const configFilePath = getConfigFilePath(projectRoot, explicitConfigFilePath);
  for (const filepath of configFilePath) {
    const config = match3(await loadConfigFile(filepath)).with({ default: P3.not(P3.nullish) }, (c) => c.default).with(P3.not(P3.nullish), (c) => c).otherwise(() => null);
    if (config) {
      debug6("loaded currents config from '%s'\n%O", filepath, config);
      info(`Using config file: ${dim(filepath)}`);
      _config = {
        ...defaultConfig,
        ...config
      };
      return _config;
    }
  }
  warn(
    "Failed to load config file, falling back to the default config. Attempted locations: %s",
    configFilePath
  );
  _config = defaultConfig;
  return _config;
}
async function loadConfigFile(filepath) {
  try {
    debug6("loading currents config file from '%s'", filepath);
    return await import(filepath);
  } catch (e) {
    debug6("failed loading config file from: %s", e);
    return null;
  }
}
async function getMergedConfig(params) {
  debug6("resolving cypress config");
  const cypressResolvedConfig = await bootCypress(params);
  debug6("cypress resolvedConfig: %O", cypressResolvedConfig);
  const rawE2EPattern = cypressResolvedConfig.rawJson?.e2e?.specPattern;
  let additionalIgnorePattern = [];
  if (params.testingType === "component" && rawE2EPattern) {
    additionalIgnorePattern = rawE2EPattern;
  }
  const result = {
    projectRoot: cypressResolvedConfig?.projectRoot || process.cwd(),
    projectId: params.projectId,
    specPattern: cypressResolvedConfig?.specPattern || "**/*.*",
    excludeSpecPattern: (
      // @ts-ignore
      cypressResolvedConfig?.resolved.excludeSpecPattern.value ?? []
    ),
    additionalIgnorePattern,
    resolved: cypressResolvedConfig,
    experimentalCoverageRecording: params.experimentalCoverageRecording
  };
  debug6("merged config: %O", result);
  return result;
}

// lib/config/params.ts
import Debug6 from "debug";
import _3 from "lodash";
var debug7 = Debug6("currents:validateParams");
async function resolveCurrentsParams(params) {
  const configFromFile = await getCurrentsConfig(
    params.project,
    params.cloudConfigFile
  );
  debug7("resolving currents params: %o", params);
  debug7("resolving currents config file: %o", configFromFile);
  const cloudServiceUrl = params.cloudServiceUrl ?? process.env.CURRENTS_API_URL ?? configFromFile.cloudServiceUrl;
  const recordKey = params.recordKey ?? process.env.CURRENTS_RECORD_KEY ?? configFromFile.recordKey;
  const projectId = params.projectId ?? process.env.CURRENTS_PROJECT_ID ?? configFromFile.projectId;
  const testingType = params.testingType ?? "e2e";
  let batchSize = params.batchSize;
  if (!batchSize) {
    batchSize = testingType === "e2e" ? configFromFile.e2e.batchSize : configFromFile.component.batchSize;
  }
  return {
    ...params,
    cloudServiceUrl,
    recordKey,
    projectId,
    batchSize,
    testingType
  };
}
var projectIdError = `Cannot resolve projectId. Please use one of the following:
- provide it as a "projectId" property for "run" API method
- set CURRENTS_PROJECT_ID environment variable
- set "projectId" in "currents.config.{c}js" file`;
var cloudServiceUrlError = `Cannot resolve cloud service URL. Please use one of the following:
- provide it as a "cloudServiceUrl" property for "run" API method
- set CURRENTS_API_URL environment variable
- set "cloudServiceUrl" in "currents.config.{c}js" file`;
var cloudServiceInvalidUrlError = `Invalid cloud service URL provided`;
var recordKeyError = `Cannot resolve record key. Please use one of the following:

- pass it as a CLI flag '-k, --key <record-key>'
- provide it as a "recordKey" property for "run" API method
- set CURRENTS_RECORD_KEY environment variable
- set "recordKey" in "currents.config.{c}js" file
`;
async function validateParams(_params) {
  const params = await resolveCurrentsParams(_params);
  debug7("validating currents params: %o", params);
  if (!params.cloudServiceUrl) {
    throw new ValidationError(cloudServiceUrlError);
  }
  if (!params.projectId) {
    throw new ValidationError(projectIdError);
  }
  if (!params.recordKey) {
    throw new ValidationError(recordKeyError);
  }
  validateURL(params.cloudServiceUrl);
  const requiredParameters = [
    "testingType",
    "batchSize",
    "projectId"
  ];
  requiredParameters.forEach((key) => {
    if (typeof params[key] === "undefined") {
      error('Missing required parameter "%s"', key);
      throw new Error("Missing required parameter");
    }
  });
  params.tag = parseTags(params.tag);
  params.autoCancelAfterFailures = getAutoCancelValue(
    params.autoCancelAfterFailures
  );
  debug7("validated currents params: %o", params);
  return params;
}
function getAutoCancelValue(value) {
  if (typeof value === "undefined") {
    return void 0;
  }
  if (typeof value === "boolean") {
    return value ? 1 : false;
  }
  if (typeof value === "number" && value > 0) {
    return value;
  }
  throw new ValidationError(
    `autoCancelAfterFailures: should be a positive integer or "false". Got: "${value}"`
  );
}
function isOffline(params) {
  return params.record === false;
}
function parseTags(tagString) {
  if (!tagString) {
    return [];
  }
  if (Array.isArray(tagString)) {
    return tagString.filter(Boolean);
  }
  return tagString.split(",").map((tag) => tag.trim()).filter(Boolean);
}
function validateURL(url) {
  try {
    new URL(url);
  } catch (err) {
    throw new ValidationError(`${cloudServiceInvalidUrlError}: "${url}"`);
  }
}
function getCypressRunAPIParams(params) {
  return {
    ..._3.pickBy(
      _3.omit(params, [
        "cloudDebug",
        "cloudConfigFile",
        "autoCancelAfterFailures",
        "cloudServiceUrl",
        "batchSize",
        "projectId",
        "key",
        "recordKey",
        "record",
        "group",
        "parallel",
        "tag",
        "ciBuildId",
        "spec",
        "exit",
        "headless",
        "experimentalCoverageRecording"
      ]),
      Boolean
    ),
    record: false,
    env: {
      ...params.env,
      currents_debug_enabled: shouldEnablePluginDebug(params.cloudDebug)
    }
  };
}
function preprocessParams(params) {
  return {
    ...params,
    spec: processSpecParam(params.spec)
  };
}
function processSpecParam(spec) {
  if (!spec) {
    return void 0;
  }
  if (Array.isArray(spec)) {
    return _3.flatten(spec.map((i) => i.split(",")));
  }
  return spec.split(",");
}

// lib/httpClient/printErrors.ts
import _4 from "lodash";
function maybePrintErrors(err) {
  if (!err.response?.data || !err.response?.status) {
    return;
  }
  const { message, errors } = err.response.data;
  switch (err.response.status) {
    case 401:
      warn("Received 401 Unauthorized");
      break;
    case 422:
      spacer(1);
      warn(...formatGenericError(message, errors));
      spacer(1);
      break;
    default:
      break;
  }
}
function formatGenericError(message, errors) {
  if (!_4.isString(message)) {
    return ["Unexpected error from the cloud service"];
  }
  if (errors?.length === 0) {
    return [message];
  }
  return [
    message,
    `
${(errors ?? []).map((e) => `  - ${e}`).join("\n")}
`
  ];
}

// lib/httpClient/httpClient.ts
var debug8 = Debug7("currents:api");
var MAX_RETRIES = 3;
var TIMEOUT_MS = 30 * 1e3;
var _client = null;
async function getClient() {
  if (_client) {
    return _client;
  }
  const currentsConfig = await getCurrentsConfig();
  _client = axios.create({
    baseURL: getAPIBaseUrl(),
    timeout: TIMEOUT_MS
  });
  _client.interceptors.request.use((config) => {
    const ccyVerson = _currentsVersion ?? "0.0.0";
    const headers = {
      ...config.headers,
      // @ts-ignore
      "x-cypress-request-attempt": config["axios-retry"]?.retryCount ?? 0,
      "x-cypress-version": _cypressVersion ?? "0.0.0",
      "x-ccy-version": ccyVerson,
      "User-Agent": `cypress-cloud/${ccyVerson}`
    };
    if (_runId) {
      headers["x-cypress-run-id"] = _runId;
    }
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (currentsConfig.networkHeaders) {
      const filteredHeaders = _5.omit(currentsConfig.networkHeaders, [
        "x-cypress-request-attempt",
        "x-cypress-version",
        "x-ccy-version",
        "x-cypress-run-id",
        "Content-Type"
      ]);
      debug8("using custom network headers: %o", filteredHeaders);
      Object.assign(headers, filteredHeaders);
    }
    const req = {
      ...config,
      headers
    };
    debug8("network request: %o", {
      ..._5.pick(req, "method", "url", "headers"),
      data: Buffer.isBuffer(req.data) ? "buffer" : req.data
    });
    return req;
  });
  axiosRetry(_client, {
    retries: MAX_RETRIES,
    retryCondition: isRetriableError,
    retryDelay: getDelay,
    // @ts-ignore
    onRetry,
    shouldResetTimeout: true
  });
  return _client;
}
function onRetry(retryCount, err, config) {
  warn(
    "Network request '%s' failed: '%s'. Next attempt is in %s (%d/%d).",
    `${config.method} ${config.url}`,
    err.message,
    prettyMilliseconds(getDelay(retryCount)),
    retryCount,
    MAX_RETRIES
  );
}
var makeRequest = async (config) => {
  return (await getClient())(config).then((res) => {
    debug8("network response: %o", _5.omit(res, "request", "config"));
    return res;
  }).catch((error2) => {
    maybePrintErrors(error2);
    throw new ValidationError(error2.message);
  });
};

// lib/api/warnings.ts
import _6 from "lodash";
function printWarnings(warnings) {
  warn("Notice from cloud service:");
  warnings.map((w) => {
    spacer(1);
    info(magenta.bold(w.message));
    Object.entries(_6.omit(w, "message")).map(([key, value]) => {
      info("- %s: %s", key, value);
    });
    spacer(1);
  });
}

// lib/api/api.ts
var createRun = async (payload) => {
  const response = await makeRequest({
    method: "POST",
    url: "/runs",
    data: payload
  });
  if ((response.data.warnings?.length ?? 0) > 0) {
    printWarnings(response.data.warnings);
  }
  return response.data;
};
var createInstance = async ({
  runId,
  groupId,
  machineId,
  platform: platform2
}) => {
  const response = await makeRequest({
    method: "POST",
    url: `runs/${runId}/instances`,
    data: {
      runId,
      groupId,
      machineId,
      platform: platform2
    }
  });
  return response.data;
};
var createBatchedInstances = async (data) => {
  const respone = await makeRequest({
    method: "POST",
    url: `runs/${data.runId}/cy/instances`,
    data
  });
  return respone.data;
};
var setInstanceTests = (instanceId, payload) => makeRequest({
  method: "POST",
  url: `instances/${instanceId}/tests`,
  data: payload
}).then((result) => result.data);
var updateInstanceResults = (instanceId, payload) => makeRequest({
  method: "POST",
  url: `instances/${instanceId}/results`,
  data: payload
}).then((result) => result.data);
var reportInstanceResultsMerged = (instanceId, payload) => makeRequest({
  method: "POST",
  url: `instances/${instanceId}/cy/results`,
  data: payload
}).then((result) => result.data);
var updateInstanceStdout = (instanceId, stdout2) => makeRequest({
  method: "PUT",
  url: `instances/${instanceId}/stdout`,
  data: {
    stdout: stdout2
  }
});

// lib/ciProvider.ts
import debugFn from "debug";
import _7 from "lodash";
var debug9 = debugFn("currents:ci");
var join = (char, ...pieces) => {
  return _7.chain(pieces).compact().join(char).value();
};
var toCamelObject = (obj, key) => {
  return _7.set(obj, _7.camelCase(key), process.env[key]);
};
var extract = (envKeys) => {
  return _7.transform(envKeys, toCamelObject, {});
};
var isTeamFoundation = () => {
  return process.env.TF_BUILD && process.env.TF_BUILD_BUILDNUMBER;
};
var isAzureCi = () => {
  return process.env.TF_BUILD && process.env.AZURE_HTTP_USER_AGENT;
};
var isAWSCodeBuild = () => {
  return _7.some(process.env, (val, key) => {
    return /^CODEBUILD_/.test(key);
  });
};
var isBamboo = () => {
  return process.env.bamboo_buildNumber;
};
var isCodeshipBasic = () => {
  return process.env.CI_NAME && process.env.CI_NAME === "codeship" && process.env.CODESHIP;
};
var isCodeshipPro = () => {
  return process.env.CI_NAME && process.env.CI_NAME === "codeship" && !process.env.CODESHIP;
};
var isConcourse = () => {
  return _7.some(process.env, (val, key) => {
    return /^CONCOURSE_/.test(key);
  });
};
var isGitlab = () => {
  return process.env.GITLAB_CI || process.env.CI_SERVER_NAME && /^GitLab/.test(process.env.CI_SERVER_NAME);
};
var isGoogleCloud = () => {
  return process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
};
var isJenkins = () => {
  return process.env.JENKINS_URL || process.env.JENKINS_HOME || process.env.JENKINS_VERSION || process.env.HUDSON_URL || process.env.HUDSON_HOME;
};
var isWercker = () => {
  return process.env.WERCKER || process.env.WERCKER_MAIN_PIPELINE_STARTED;
};
var CI_PROVIDERS = {
  appveyor: "APPVEYOR",
  azure: isAzureCi,
  awsCodeBuild: isAWSCodeBuild,
  bamboo: isBamboo,
  bitbucket: "BITBUCKET_BUILD_NUMBER",
  buildkite: "BUILDKITE",
  circle: "CIRCLECI",
  codeshipBasic: isCodeshipBasic,
  codeshipPro: isCodeshipPro,
  concourse: isConcourse,
  codeFresh: "CF_BUILD_ID",
  drone: "DRONE",
  githubActions: "GITHUB_ACTIONS",
  gitlab: isGitlab,
  goCD: "GO_JOB_NAME",
  googleCloud: isGoogleCloud,
  jenkins: isJenkins,
  semaphore: "SEMAPHORE",
  shippable: "SHIPPABLE",
  teamcity: "TEAMCITY_VERSION",
  teamfoundation: isTeamFoundation,
  travis: "TRAVIS",
  wercker: isWercker,
  netlify: "NETLIFY",
  layerci: "LAYERCI"
};
function _detectProviderName() {
  const { env } = process;
  return _7.findKey(CI_PROVIDERS, (value) => {
    if (_7.isString(value)) {
      return env[value];
    }
    if (_7.isFunction(value)) {
      return value();
    }
  });
}
var _providerCiParams = () => {
  return {
    appveyor: extract([
      "APPVEYOR_JOB_ID",
      "APPVEYOR_ACCOUNT_NAME",
      "APPVEYOR_PROJECT_SLUG",
      "APPVEYOR_BUILD_NUMBER",
      "APPVEYOR_BUILD_VERSION",
      "APPVEYOR_PULL_REQUEST_NUMBER",
      "APPVEYOR_PULL_REQUEST_HEAD_REPO_BRANCH"
    ]),
    azure: extract([
      "BUILD_BUILDID",
      "BUILD_BUILDNUMBER",
      "BUILD_CONTAINERID",
      "BUILD_REPOSITORY_URI"
    ]),
    awsCodeBuild: extract([
      "CODEBUILD_BUILD_ID",
      "CODEBUILD_BUILD_NUMBER",
      "CODEBUILD_RESOLVED_SOURCE_VERSION",
      "CODEBUILD_SOURCE_REPO_URL",
      "CODEBUILD_SOURCE_VERSION"
    ]),
    bamboo: extract([
      "bamboo_buildNumber",
      "bamboo_buildResultsUrl",
      "bamboo_planRepository_repositoryUrl",
      "bamboo_buildKey"
    ]),
    bitbucket: extract([
      "BITBUCKET_REPO_SLUG",
      "BITBUCKET_REPO_OWNER",
      "BITBUCKET_BUILD_NUMBER",
      "BITBUCKET_PARALLEL_STEP",
      "BITBUCKET_STEP_RUN_NUMBER",
      // the PR variables are only set on pull request builds
      "BITBUCKET_PR_ID",
      "BITBUCKET_PR_DESTINATION_BRANCH",
      "BITBUCKET_PR_DESTINATION_COMMIT"
    ]),
    buildkite: extract([
      "BUILDKITE_REPO",
      "BUILDKITE_SOURCE",
      "BUILDKITE_JOB_ID",
      "BUILDKITE_BUILD_ID",
      "BUILDKITE_BUILD_URL",
      "BUILDKITE_BUILD_NUMBER",
      "BUILDKITE_PULL_REQUEST",
      "BUILDKITE_PULL_REQUEST_REPO",
      "BUILDKITE_PULL_REQUEST_BASE_BRANCH"
    ]),
    circle: extract([
      "CIRCLE_JOB",
      "CIRCLE_BUILD_NUM",
      "CIRCLE_BUILD_URL",
      "CIRCLE_PR_NUMBER",
      "CIRCLE_PR_REPONAME",
      "CIRCLE_PR_USERNAME",
      "CIRCLE_COMPARE_URL",
      "CIRCLE_WORKFLOW_ID",
      "CIRCLE_PULL_REQUEST",
      "CIRCLE_REPOSITORY_URL",
      "CI_PULL_REQUEST"
    ]),
    codeshipBasic: extract([
      "CI_BUILD_ID",
      "CI_REPO_NAME",
      "CI_BUILD_URL",
      "CI_PROJECT_ID",
      "CI_BUILD_NUMBER",
      "CI_PULL_REQUEST"
    ]),
    // CodeshipPro provides very few CI variables
    // https://documentation.codeship.com/pro/builds-and-configuration/environment-variables/
    codeshipPro: extract(["CI_BUILD_ID", "CI_REPO_NAME", "CI_PROJECT_ID"]),
    // https://concourse-ci.org/implementing-resource-types.html#resource-metadata
    concourse: extract([
      "BUILD_ID",
      "BUILD_NAME",
      "BUILD_JOB_NAME",
      "BUILD_PIPELINE_NAME",
      "BUILD_TEAM_NAME",
      "ATC_EXTERNAL_URL"
    ]),
    // https://codefresh.io/docs/docs/codefresh-yaml/variables/
    codeFresh: extract([
      "CF_BUILD_ID",
      "CF_BUILD_URL",
      "CF_CURRENT_ATTEMPT",
      "CF_STEP_NAME",
      "CF_PIPELINE_NAME",
      "CF_PIPELINE_TRIGGER_ID",
      // variables added for pull requests
      "CF_PULL_REQUEST_ID",
      "CF_PULL_REQUEST_IS_FORK",
      "CF_PULL_REQUEST_NUMBER",
      "CF_PULL_REQUEST_TARGET"
    ]),
    drone: extract([
      "DRONE_JOB_NUMBER",
      "DRONE_BUILD_LINK",
      "DRONE_BUILD_NUMBER",
      "DRONE_PULL_REQUEST"
    ]),
    // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/using-environment-variables#default-environment-variables
    githubActions: extract([
      "GITHUB_WORKFLOW",
      "GITHUB_ACTION",
      "GITHUB_EVENT_NAME",
      "GITHUB_RUN_ID",
      "GITHUB_RUN_ATTEMPT",
      "GITHUB_REPOSITORY"
    ]),
    // see https://docs.gitlab.com/ee/ci/variables/
    gitlab: extract([
      // pipeline is common among all jobs
      "CI_PIPELINE_ID",
      "CI_PIPELINE_URL",
      // individual jobs
      "CI_BUILD_ID",
      // build id and job id are aliases
      "CI_JOB_ID",
      "CI_JOB_URL",
      "CI_JOB_NAME",
      // other information
      "GITLAB_HOST",
      "CI_PROJECT_ID",
      "CI_PROJECT_URL",
      "CI_REPOSITORY_URL",
      "CI_ENVIRONMENT_URL",
      "CI_DEFAULT_BRANCH"
      // for PRs: https://gitlab.com/gitlab-org/gitlab-ce/issues/23902
    ]),
    // https://docs.gocd.org/current/faq/dev_use_current_revision_in_build.html#standard-gocd-environment-variables
    goCD: extract([
      "GO_SERVER_URL",
      "GO_ENVIRONMENT_NAME",
      "GO_PIPELINE_NAME",
      "GO_PIPELINE_COUNTER",
      "GO_PIPELINE_LABEL",
      "GO_STAGE_NAME",
      "GO_STAGE_COUNTER",
      "GO_JOB_NAME",
      "GO_TRIGGER_USER",
      "GO_REVISION",
      "GO_TO_REVISION",
      "GO_FROM_REVISION",
      "GO_MATERIAL_HAS_CHANGED"
    ]),
    googleCloud: extract([
      // individual jobs
      "BUILD_ID",
      "PROJECT_ID",
      // other information
      "REPO_NAME",
      "BRANCH_NAME",
      "TAG_NAME",
      "COMMIT_SHA",
      "SHORT_SHA"
      // https://cloud.google.com/cloud-build/docs/api/reference/rest/Shared.Types/Build
    ]),
    jenkins: extract(["BUILD_ID", "BUILD_URL", "BUILD_NUMBER", "ghprbPullId"]),
    // https://semaphoreci.com/docs/available-environment-variables.html
    // some come from v1, some from v2 of semaphore
    semaphore: extract([
      "SEMAPHORE_BRANCH_ID",
      "SEMAPHORE_BUILD_NUMBER",
      "SEMAPHORE_CURRENT_JOB",
      "SEMAPHORE_CURRENT_THREAD",
      "SEMAPHORE_EXECUTABLE_UUID",
      "SEMAPHORE_GIT_BRANCH",
      "SEMAPHORE_GIT_DIR",
      "SEMAPHORE_GIT_REF",
      "SEMAPHORE_GIT_REF_TYPE",
      "SEMAPHORE_GIT_REPO_SLUG",
      "SEMAPHORE_GIT_SHA",
      "SEMAPHORE_GIT_URL",
      "SEMAPHORE_JOB_COUNT",
      "SEMAPHORE_JOB_ID",
      // v2
      "SEMAPHORE_JOB_NAME",
      "SEMAPHORE_JOB_UUID",
      // v1
      "SEMAPHORE_PIPELINE_ID",
      "SEMAPHORE_PLATFORM",
      "SEMAPHORE_PROJECT_DIR",
      "SEMAPHORE_PROJECT_HASH_ID",
      "SEMAPHORE_PROJECT_ID",
      // v2
      "SEMAPHORE_PROJECT_NAME",
      "SEMAPHORE_PROJECT_UUID",
      // v1
      "SEMAPHORE_REPO_SLUG",
      "SEMAPHORE_TRIGGER_SOURCE",
      "SEMAPHORE_WORKFLOW_ID",
      "PULL_REQUEST_NUMBER"
      // pull requests from forks ONLY
    ]),
    // see http://docs.shippable.com/ci/env-vars/
    shippable: extract([
      // build variables
      "SHIPPABLE_BUILD_ID",
      // "5b93354cabfabb07007f01fd"
      "SHIPPABLE_BUILD_NUMBER",
      // "4"
      "SHIPPABLE_COMMIT_RANGE",
      // "sha1...sha2"
      "SHIPPABLE_CONTAINER_NAME",
      // "c.exec.cypress-example-kitchensink.4.1"
      "SHIPPABLE_JOB_ID",
      // "1"
      "SHIPPABLE_JOB_NUMBER",
      // "1"
      "SHIPPABLE_REPO_SLUG",
      // "<username>/<repo>"
      // additional information that Shippable provides
      "IS_FORK",
      // "true"
      "IS_GIT_TAG",
      // "false"
      "IS_PRERELEASE",
      // "false"
      "IS_RELEASE",
      // "false"
      "REPOSITORY_URL",
      // "https://github.com/....git"
      "REPO_FULL_NAME",
      // "<username>/<repo>"
      "REPO_NAME",
      // "cypress-example-kitchensink"
      "BUILD_URL",
      // "https://app.shippable.com/github/<username>/<repo>/runs/1"
      // Pull request information
      "BASE_BRANCH",
      // Name of the target branch into which the pull request changes will be merged.
      "HEAD_BRANCH",
      // This is only set for pull requests and is the name of the branch the pull request was opened from.
      "IS_PULL_REQUEST",
      // "false" or "true"
      "PULL_REQUEST",
      // Pull request number if the job is a pull request. If not, this will be set to false.
      "PULL_REQUEST_BASE_BRANCH",
      // Name of the branch that the pull request will be merged into. It should be the same as BASE_BRANCH.
      "PULL_REQUEST_REPO_FULL_NAME"
      // Full name of the repository from where the pull request originated.
    ]),
    teamcity: null,
    teamfoundation: extract([
      "BUILD_BUILDID",
      "BUILD_BUILDNUMBER",
      "BUILD_CONTAINERID"
    ]),
    travis: extract([
      "TRAVIS_JOB_ID",
      "TRAVIS_BUILD_ID",
      "TRAVIS_BUILD_WEB_URL",
      "TRAVIS_REPO_SLUG",
      "TRAVIS_JOB_NUMBER",
      "TRAVIS_EVENT_TYPE",
      "TRAVIS_COMMIT_RANGE",
      "TRAVIS_BUILD_NUMBER",
      "TRAVIS_PULL_REQUEST",
      "TRAVIS_PULL_REQUEST_BRANCH",
      "TRAVIS_PULL_REQUEST_SHA"
    ]),
    wercker: null,
    // https://docs.netlify.com/configure-builds/environment-variables/#deploy-urls-and-metadata
    netlify: extract([
      "BUILD_ID",
      "CONTEXT",
      "URL",
      "DEPLOY_URL",
      "DEPLOY_PRIME_URL",
      "DEPLOY_ID"
    ]),
    // https://layerci.com/docs/layerfile-reference/build-env
    layerci: extract([
      "LAYERCI_JOB_ID",
      "LAYERCI_RUNNER_ID",
      "RETRY_INDEX",
      "LAYERCI_PULL_REQUEST",
      "LAYERCI_REPO_NAME",
      "LAYERCI_REPO_OWNER",
      "LAYERCI_BRANCH",
      "GIT_TAG"
      // short hex for commits
    ])
  };
};
var _providerCommitParams = () => {
  const { env } = process;
  return {
    appveyor: {
      sha: env.APPVEYOR_REPO_COMMIT,
      // since APPVEYOR_REPO_BRANCH will be the target branch on a PR
      // we need to use PULL_REQUEST_HEAD_REPO_BRANCH if it exists.
      // e.g. if you have a PR: develop <- my-feature-branch
      // my-feature-branch is APPVEYOR_PULL_REQUEST_HEAD_REPO_BRANCH
      // develop           is APPVEYOR_REPO_BRANCH
      branch: env.APPVEYOR_PULL_REQUEST_HEAD_REPO_BRANCH || env.APPVEYOR_REPO_BRANCH,
      message: join(
        "\n",
        env.APPVEYOR_REPO_COMMIT_MESSAGE,
        env.APPVEYOR_REPO_COMMIT_MESSAGE_EXTENDED
      ),
      authorName: env.APPVEYOR_REPO_COMMIT_AUTHOR,
      authorEmail: env.APPVEYOR_REPO_COMMIT_AUTHOR_EMAIL
      // remoteOrigin: ???
      // defaultBranch: ???
    },
    awsCodeBuild: {
      sha: env.CODEBUILD_RESOLVED_SOURCE_VERSION,
      // branch: ???,
      // message: ???
      // authorName: ???
      // authorEmail: ???
      remoteOrigin: env.CODEBUILD_SOURCE_REPO_URL
      // defaultBranch: ???
    },
    azure: {
      sha: env.BUILD_SOURCEVERSION,
      branch: env.BUILD_SOURCEBRANCHNAME,
      message: env.BUILD_SOURCEVERSIONMESSAGE,
      authorName: env.BUILD_SOURCEVERSIONAUTHOR,
      authorEmail: env.BUILD_REQUESTEDFOREMAIL
    },
    bamboo: {
      sha: env.bamboo_planRepository_revision,
      branch: env.bamboo_planRepository_branch,
      // message: ???
      authorName: env.bamboo_planRepository_username,
      // authorEmail: ???
      remoteOrigin: env.bamboo_planRepository_repositoryURL
      // defaultBranch: ???
    },
    bitbucket: {
      sha: env.BITBUCKET_COMMIT,
      branch: env.BITBUCKET_BRANCH
      // message: ???
      // authorName: ???
      // authorEmail: ???
      // remoteOrigin: ???
      // defaultBranch: ???
    },
    buildkite: {
      sha: env.BUILDKITE_COMMIT,
      branch: env.BUILDKITE_BRANCH,
      message: env.BUILDKITE_MESSAGE,
      authorName: env.BUILDKITE_BUILD_CREATOR,
      authorEmail: env.BUILDKITE_BUILD_CREATOR_EMAIL,
      remoteOrigin: env.BUILDKITE_REPO,
      defaultBranch: env.BUILDKITE_PIPELINE_DEFAULT_BRANCH
    },
    circle: {
      sha: env.CIRCLE_SHA1,
      branch: env.CIRCLE_BRANCH,
      // message: ???
      authorName: env.CIRCLE_USERNAME,
      // authorEmail: ???
      remoteOrigin: env.CIRCLE_REPOSITORY_URL
      // defaultBranch: ???
    },
    codeshipBasic: {
      sha: env.CI_COMMIT_ID,
      branch: env.CI_BRANCH,
      message: env.CI_COMMIT_MESSAGE,
      authorName: env.CI_COMMITTER_NAME,
      authorEmail: env.CI_COMMITTER_EMAIL
      // remoteOrigin: ???
      // defaultBranch: ???
    },
    codeshipPro: {
      sha: env.CI_COMMIT_ID,
      branch: env.CI_BRANCH,
      message: env.CI_COMMIT_MESSAGE,
      authorName: env.CI_COMMITTER_NAME,
      authorEmail: env.CI_COMMITTER_EMAIL
      // remoteOrigin: ???
      // defaultBranch: ???
    },
    codeFresh: {
      sha: env.CF_REVISION,
      branch: env.CF_BRANCH,
      message: env.CF_COMMIT_MESSAGE,
      authorName: env.CF_COMMIT_AUTHOR
    },
    drone: {
      sha: env.DRONE_COMMIT_SHA,
      // https://docs.drone.io/pipeline/environment/reference/drone-source-branch/
      branch: env.DRONE_SOURCE_BRANCH,
      message: env.DRONE_COMMIT_MESSAGE,
      authorName: env.DRONE_COMMIT_AUTHOR,
      authorEmail: env.DRONE_COMMIT_AUTHOR_EMAIL,
      remoteOrigin: env.DRONE_GIT_HTTP_URL,
      defaultBranch: env.DRONE_REPO_BRANCH
    },
    githubActions: {
      sha: env.GITHUB_SHA,
      branch: env.GH_BRANCH || env.GITHUB_REF,
      defaultBranch: env.GITHUB_BASE_REF,
      remoteBranch: env.GITHUB_HEAD_REF,
      runAttempt: env.GITHUB_RUN_ATTEMPT
    },
    gitlab: {
      sha: env.CI_COMMIT_SHA,
      branch: env.CI_COMMIT_REF_NAME,
      message: env.CI_COMMIT_MESSAGE,
      authorName: env.GITLAB_USER_NAME,
      authorEmail: env.GITLAB_USER_EMAIL,
      remoteOrigin: env.CI_REPOSITORY_URL,
      defaultBranch: env.CI_DEFAULT_BRANCH
    },
    googleCloud: {
      sha: env.COMMIT_SHA,
      branch: env.BRANCH_NAME
      // message: ??
      // authorName: ??
      // authorEmail: ??
      // remoteOrigin: ???
      // defaultBranch: ??
    },
    jenkins: {
      sha: env.GIT_COMMIT,
      branch: env.GIT_BRANCH
      // message: ???
      // authorName: ???
      // authorEmail: ???
      // remoteOrigin: ???
      // defaultBranch: ???
    },
    // Only from forks? https://semaphoreci.com/docs/available-environment-variables.html
    semaphore: {
      sha: env.SEMAPHORE_GIT_SHA,
      branch: env.SEMAPHORE_GIT_BRANCH,
      // message: ???
      // authorName: ???
      // authorEmail: ???
      remoteOrigin: env.SEMAPHORE_GIT_REPO_SLUG
      // defaultBranch: ???
    },
    shippable: {
      sha: env.COMMIT,
      branch: env.BRANCH,
      message: env.COMMIT_MESSAGE,
      authorName: env.COMMITTER
      // authorEmail: ???
      // remoteOrigin: ???
      // defaultBranch: ???
    },
    snap: null,
    teamcity: null,
    teamfoundation: {
      sha: env.BUILD_SOURCEVERSION,
      branch: env.BUILD_SOURCEBRANCHNAME,
      message: env.BUILD_SOURCEVERSIONMESSAGE,
      authorName: env.BUILD_SOURCEVERSIONAUTHOR
    },
    travis: {
      sha: env.TRAVIS_PULL_REQUEST_SHA || env.TRAVIS_COMMIT,
      // for PRs, TRAVIS_BRANCH is the base branch being merged into
      branch: env.TRAVIS_PULL_REQUEST_BRANCH || env.TRAVIS_BRANCH,
      // authorName: ???
      // authorEmail: ???
      message: env.TRAVIS_COMMIT_MESSAGE
      // remoteOrigin: ???
      // defaultBranch: ???
    },
    wercker: null,
    netlify: {
      sha: env.COMMIT_REF,
      branch: env.BRANCH,
      remoteOrigin: env.REPOSITORY_URL
    },
    layerci: {
      sha: env.GIT_COMMIT,
      branch: env.LAYERCI_BRANCH,
      message: env.GIT_COMMIT_TITLE
    }
  };
};
var _get = (fn) => {
  const providerName = getCiProvider();
  if (!providerName)
    return {};
  return _7.chain(fn()).get(providerName).value();
};
function checkForCiBuildFromCi(ciProvider) {
  if (ciProvider && detectableCiBuildIdProviders().includes(ciProvider))
    return true;
  throw new ValidationError(
    `Could not determine CI build ID from the environment. Please provide a unique CI build ID using the --ci-build-id CLI flag or 'ciBuildId' parameter for 'run' method.`
  );
}
function detectableCiBuildIdProviders() {
  return _7.chain(_providerCiParams()).omitBy(_7.isNull).keys().value();
}
function getCiProvider() {
  return _detectProviderName() || null;
}
function getCiParams() {
  return _get(_providerCiParams);
}
function getCommitParams() {
  return _get(_providerCommitParams);
}
function getCI(ciBuildId) {
  const params = getCiParams();
  const provider = getCiProvider();
  if (!ciBuildId)
    checkForCiBuildFromCi(provider);
  debug9("detected CI provider: %s", provider);
  debug9("detected CI params: %O", params);
  return {
    params,
    provider
  };
}
function getCommitDefaults(existingInfo) {
  debug9("git commit existing info");
  debug9(existingInfo);
  const commitParamsObj = getCommitParams();
  debug9("commit info from provider environment variables: %O", commitParamsObj);
  const combined = _7.transform(
    existingInfo,
    (memo, value, key) => {
      return memo[key] = _7.defaultTo(value || commitParamsObj[key], null);
    }
  );
  debug9("combined git and environment variables from provider");
  debug9(combined);
  return combined;
}

// lib/cypress/cypress.ts
import cypress from "cypress";
import Debug8 from "debug";
import _8 from "lodash";

// lib/results/moduleAPIResult.ts
import { parseISO as parseISO2 } from "date-fns";

// lib/results/specAfterResult.ts
import { parseISO } from "date-fns";
import { match as match4 } from "ts-pattern";
var SpecAfterResult = class _SpecAfterResult {
  /**
   * Combine standalone attempts and screenshots into standard result
   * @param specResult - spec:after results
   * @param executionState - ccy execution state
   * @returns unified results, including attempts and screenshot details
   */
  static getSpecAfterStandard(specAfterResults, executionState) {
    return {
      error: specAfterResults.error,
      // hooks: "hooks" in specAfterResults ? specAfterResults.hooks : null,
      hooks: null,
      reporter: specAfterResults.reporter,
      reporterStats: specAfterResults.reporterStats,
      spec: _SpecAfterResult.getSpecStandard(specAfterResults.spec),
      tests: _SpecAfterResult.getTestStandard(
        specAfterResults,
        executionState.getAttemptsData()
      ),
      video: specAfterResults.video,
      stats: _SpecAfterResult.getStatsStandard(specAfterResults.stats),
      screenshots: _SpecAfterResult.getScreenshotsStandard(
        specAfterResults.screenshots,
        executionState.getScreenshotsData()
      )
    };
  }
  static getAttemptError(err) {
    if (!err) {
      return null;
    }
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      codeFrame: err.codeFrame
    };
  }
  static getAttemptVideoTimestamp(attemptStartedAtMs, specStartedAtMs) {
    return Math.max(attemptStartedAtMs - specStartedAtMs, 0);
  }
  static getSpecStartedAt(stats) {
    if ("startedAt" in stats) {
      return parseISO(stats.startedAt);
    }
    if ("wallClockStartedAt" in stats) {
      return parseISO(stats.wallClockStartedAt);
    }
    warn("Cannot determine spec start date from stats: %o", stats);
    return /* @__PURE__ */ new Date();
  }
  static getDummyTestAttemptError(attemptState) {
    return match4(attemptState).with("failed", () => ({
      name: "Error",
      message: "[cypress-cloud] Could not get cypress attempt error details",
      stack: "",
      codeFrame: null
    })).with("skipped", () => ({
      name: "Error",
      message: "The test was skipped because of a hook failure",
      stack: "",
      codeFrame: null
    })).otherwise(() => null);
  }
  static getTestAttemptStandard(mochaAttempt, cypressAttempt, specStartedAt) {
    if (!mochaAttempt) {
      const error2 = "error" in cypressAttempt ? cypressAttempt.error : null;
      const duration = "wallClockDuration" in cypressAttempt ? cypressAttempt.wallClockDuration : null;
      return {
        state: cypressAttempt.state,
        error: error2 ? error2 : _SpecAfterResult.getDummyTestAttemptError(cypressAttempt.state),
        timings: "timings" in cypressAttempt ? cypressAttempt.timings : null,
        wallClockStartedAt: "wallClockStartedAt" in cypressAttempt ? cypressAttempt.wallClockStartedAt : (/* @__PURE__ */ new Date()).toISOString(),
        wallClockDuration: duration ? duration : 0,
        failedFromHookId: "failedFromHookId" in cypressAttempt ? cypressAttempt.failedFromHookId : null,
        videoTimestamp: "videoTimestamp" in cypressAttempt ? cypressAttempt.videoTimestamp : 0
      };
    }
    return {
      state: cypressAttempt.state,
      error: "error" in cypressAttempt ? cypressAttempt.error : _SpecAfterResult.getAttemptError(mochaAttempt.err),
      timings: "timings" in cypressAttempt ? cypressAttempt.timings : mochaAttempt.timings,
      wallClockStartedAt: mochaAttempt.wallClockStartedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      wallClockDuration: mochaAttempt.duration ?? -1,
      failedFromHookId: "failedFromHookId" in cypressAttempt ? cypressAttempt.failedFromHookId : null,
      videoTimestamp: "videoTimestamp" in cypressAttempt ? cypressAttempt.videoTimestamp : _SpecAfterResult.getAttemptVideoTimestamp(
        parseISO(mochaAttempt.wallClockStartedAt).getTime(),
        specStartedAt.getTime()
      )
    };
  }
  static getTestStandard(specAfterResults, attempts) {
    const standardTestList = (specAfterResults.tests ?? []).map((test, i) => {
      const mochaAttempts = attempts.filter(
        (attempt) => attempt.fullTitle === test.title.join(" ")
      );
      const standardAttempts = (test.attempts ?? []).map(
        (cypressAttempt, j) => {
          const mochaAttempt = mochaAttempts.find(
            (ma) => ma.currentRetry === j
          );
          return _SpecAfterResult.getTestAttemptStandard(
            mochaAttempt ?? null,
            cypressAttempt,
            _SpecAfterResult.getSpecStartedAt(specAfterResults.stats)
          );
        }
      );
      return {
        body: "body" in test ? test.body : mochaAttempts[0]?.body ?? "",
        testId: "testId" in test ? test.testId : mochaAttempts[0]?.id ?? `r${i}`,
        title: test.title,
        displayError: test.displayError,
        state: test.state,
        attempts: standardAttempts
      };
    });
    return standardTestList;
  }
  static getSpecStandard(spec) {
    return {
      name: spec.name,
      relative: spec.relative,
      absolute: spec.absolute,
      fileExtension: spec.fileExtension,
      baseName: "baseName" in spec ? spec.baseName : "",
      fileName: "fileName" in spec ? spec.fileName : "",
      relativeToCommonRoot: "relativeToCommonRoot" in spec ? spec.relativeToCommonRoot : "",
      specFileExtension: "specFileExtension" in spec ? spec.specFileExtension : "",
      specType: "specType" in spec ? spec.specType : ""
    };
  }
  static getStatsStandard(stats) {
    const result = {
      skipped: stats.skipped,
      suites: stats.suites,
      tests: stats.tests,
      passes: stats.passes,
      pending: stats.pending,
      failures: stats.failures,
      wallClockStartedAt: "wallClockStartedAt" in stats ? stats.wallClockStartedAt : stats.startedAt,
      wallClockEndedAt: "wallClockEndedAt" in stats ? stats.wallClockEndedAt : stats.endedAt,
      wallClockDuration: "wallClockDuration" in stats ? stats.wallClockDuration : stats.duration ?? 0
    };
    result.tests = result.passes + result.failures + result.pending + result.skipped;
    return result;
  }
  static getScreenshotsStandard(specAfterScreenshots, screenshotEvents) {
    if (!specAfterScreenshots.length) {
      return [];
    }
    return specAfterScreenshots.map((specScreenshot) => {
      const es = screenshotEvents.find(
        (screenshot) => screenshot.path === specScreenshot.path
      );
      if (!es) {
        warn(
          'Could not find details for screenshot at path "%s", skipping...',
          specScreenshot.path
        );
      }
      return {
        height: specScreenshot.height,
        width: specScreenshot.width,
        name: specScreenshot.name ?? es?.name ?? null,
        path: specScreenshot.path,
        takenAt: specScreenshot.takenAt,
        testAttemptIndex: "testAttemptIndex" in specScreenshot ? specScreenshot.testAttemptIndex : es?.testAttemptIndex ?? -1,
        testId: "testId" in specScreenshot ? specScreenshot.testId : es?.testId ?? "unknown",
        screenshotId: "screenshotId" in specScreenshot ? specScreenshot.screenshotId : getRandomString()
      };
    });
  }
};

// lib/results/moduleAPIResult.ts
var ModuleAPIResults = class _ModuleAPIResults {
  static getRunScreenshots(run3) {
    if ("screenshots" in run3) {
      return run3.screenshots;
    }
    return (run3.tests ?? []).flatMap(
      (t) => t.attempts.flatMap((a) => a.screenshots)
    );
  }
  static getTests(run3, executionState) {
    const tests = run3.tests ?? [];
    return tests.map((test, i) => {
      const mochaAttempts = executionState.getAttemptsData().filter((attempt) => attempt.fullTitle === test.title.join(" "));
      const testId = "testId" in test ? test.testId : mochaAttempts[0]?.id ?? `r${i}`;
      const runScreenshotPaths = _ModuleAPIResults.getRunScreenshots(run3).map(
        (i2) => i2.path
      );
      const testScreenshots = executionState.getScreenshotsData().filter((s) => runScreenshotPaths.includes(s.path)).filter((s) => s.testId === testId);
      const standardAttempts = (test.attempts ?? []).map(
        (cypressAttempt, j) => {
          const mochaAttempt = mochaAttempts.find(
            (ma) => ma.currentRetry === j
          );
          const attemptScreenshots = testScreenshots.filter(
            (t) => t.testAttemptIndex === j
          );
          return _ModuleAPIResults.getTestAttempt(
            mochaAttempt ?? null,
            cypressAttempt,
            attemptScreenshots,
            // run only has 1 spec
            SpecAfterResult.getSpecStartedAt(run3.stats)
          );
        }
      );
      return {
        body: "body" in test ? test.body : mochaAttempts[0]?.body ?? "",
        testId,
        title: test.title,
        displayError: test.displayError,
        state: test.state,
        attempts: standardAttempts
      };
    });
  }
  /**
   * Convert version-specific attempt to a standard test attempt
   */
  static getTestAttempt(mochaAttempt, cypressAttempt, screenshots, specStartedAt) {
    if (!mochaAttempt) {
      return {
        state: cypressAttempt.state,
        error: "error" in cypressAttempt ? cypressAttempt.error : SpecAfterResult.getDummyTestAttemptError(cypressAttempt.state),
        startedAt: "startedAt" in cypressAttempt ? cypressAttempt.startedAt : (/* @__PURE__ */ new Date()).toISOString(),
        duration: "duration" in cypressAttempt ? cypressAttempt.duration : 0,
        videoTimestamp: "videoTimestamp" in cypressAttempt ? cypressAttempt.videoTimestamp : 0,
        screenshots: "screenshots" in cypressAttempt ? cypressAttempt.screenshots : screenshots
      };
    }
    return {
      state: cypressAttempt.state,
      error: "error" in cypressAttempt ? cypressAttempt.error : SpecAfterResult.getAttemptError(mochaAttempt.err),
      startedAt: "startedAt" in cypressAttempt ? cypressAttempt.startedAt : mochaAttempt.wallClockStartedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
      duration: "duration" in cypressAttempt ? cypressAttempt.duration : mochaAttempt.duration ?? -1,
      videoTimestamp: "videoTimestamp" in cypressAttempt ? cypressAttempt.videoTimestamp : SpecAfterResult.getAttemptVideoTimestamp(
        parseISO2(mochaAttempt.wallClockStartedAt).getTime(),
        specStartedAt.getTime()
      ),
      screenshots: "screenshots" in cypressAttempt ? cypressAttempt.screenshots : screenshots
    };
  }
  static getRun(run3, executionState) {
    return {
      ...run3,
      tests: _ModuleAPIResults.getTests(run3, executionState),
      spec: SpecAfterResult.getSpecStandard(run3.spec),
      // hooks: "hooks" in run ? run.hooks : [],
      hooks: null,
      shouldUploadVideo: "shouldUploadVideo" in run3 ? run3.shouldUploadVideo : true
    };
  }
  /**
   * Converts different Cypress versions to standard form
   */
  static getStandardResult(result, executionState) {
    if (result.runs.length !== 1) {
      throw new Error("Expected single run");
    }
    const run3 = result.runs[0];
    const stats = SpecAfterResult.getStatsStandard(run3.stats);
    return {
      ...result,
      runs: [_ModuleAPIResults.getRun(run3, executionState)],
      totalSuites: 1,
      totalDuration: stats.wallClockDuration,
      totalTests: stats.tests,
      totalFailed: stats.failures,
      totalPassed: stats.passes,
      totalPending: stats.pending,
      totalSkipped: stats.skipped,
      startedTestsAt: stats.wallClockStartedAt,
      endedTestsAt: stats.wallClockEndedAt,
      status: "finished"
    };
  }
  static isFailureResult(result) {
    return "status" in result && result.status === "failed";
  }
  static {
    this.isSuccessResult = (result) => {
      if ("status" in result) {
        return result.status === "finished";
      }
      return true;
    };
  }
  static getEmptyResult(config) {
    return {
      status: "finished",
      totalDuration: 0,
      totalSuites: 0,
      totalPending: 0,
      totalFailed: 0,
      totalSkipped: 0,
      totalPassed: 0,
      totalTests: 0,
      startedTestsAt: (/* @__PURE__ */ new Date()).toISOString(),
      endedTestsAt: (/* @__PURE__ */ new Date()).toISOString(),
      runs: [],
      // @ts-ignore
      config
    };
  }
};

// lib/cypress/cypress.ts
var debug10 = Debug8("currents:cypress");
function runBareCypress(params = {}) {
  const p = {
    ...params,
    ciBuildId: void 0,
    tag: void 0,
    parallel: void 0,
    record: false,
    group: void 0,
    spec: _8.flatten(params.spec).join(",")
  };
  debug10("Running bare Cypress with params %o", p);
  return cypress.run(p);
}
async function runSpecFile({ spec }, cypressRunOptions) {
  const runAPIOptions = getCypressRunAPIParams(cypressRunOptions);
  const options = {
    ...runAPIOptions,
    config: {
      ...runAPIOptions.config,
      trashAssetsBeforeRuns: false
    },
    env: {
      ...runAPIOptions.env,
      currents_ws: getWSSPort(),
      currents_marker: true
    },
    spec
  };
  debug10("running cypress with options %o", options);
  const result = await cypress.run(options);
  if (ModuleAPIResults.isFailureResult(result)) {
    warn('Cypress runner failed with message: "%s"', result.message);
    warn(
      "The following spec files will be marked as failed: %s",
      spec.split(",").map((i) => `
 - ${i}`).join("")
    );
  }
  debug10("cypress run result %o", result);
  return result;
}
var runSpecFileSafe = (spec, cypressRunOptions) => safe(
  runSpecFile,
  (error2) => {
    const message = `Cypress runnner crashed with an error:
${error2.message}
${error2.stack}}`;
    debug10("cypress run exception %o", error2);
    warn('Cypress runner crashed: "%s"', message);
    warn(
      "The following spec files will be marked as failed: %s",
      spec.spec.split(",").map((i) => `
 - ${i}`).join("")
    );
    return {
      status: "failed",
      failures: 1,
      message
    };
  },
  () => {
  }
)(spec, cypressRunOptions);

// lib/env.ts
var isCurrents = () => !!process.env.CURRENTS_ENFORCE_IS_CURRENTS || getAPIBaseUrl() === "https://cy.currents.dev";

// lib/git.ts
import git from "@cypress/commit-info";
var getGitInfo = async (projectRoot) => {
  const commitInfo = await git.commitInfo(projectRoot);
  return getCommitDefaults({
    branch: commitInfo.branch,
    remoteOrigin: commitInfo.remote,
    authorEmail: commitInfo.email,
    authorName: commitInfo.author,
    message: commitInfo.message,
    sha: commitInfo.sha
  });
};

// lib/listener.ts
import Debug16 from "debug";

// lib/results/captureHooks.ts
import Debug15 from "debug";

// lib/coverage/index.ts
import fs2 from "fs/promises";
import { join as join2 } from "path";
var getCoverageFilePath = async (coverageFile = "./.nyc_output/out.json") => {
  const path5 = join2(process.cwd(), coverageFile);
  try {
    await fs2.access(path5);
    return {
      path: path5,
      error: false
    };
  } catch (error2) {
    return {
      path: path5,
      error: error2
    };
  }
};

// lib/runner/runner.ts
import Debug14 from "debug";

// lib/runner/reportTask.ts
import Debug13 from "debug";

// lib/results/summarize.ts
import _9 from "lodash";

// lib/results/empty.ts
var emptyStats = {
  totalDuration: 0,
  totalSuites: 0,
  totalPending: 0,
  totalFailed: 0,
  totalSkipped: 0,
  totalPassed: 0,
  totalTests: 0
};
var getDummyFailedTest = (start, error2) => ({
  title: ["Unknown"],
  state: "failed",
  body: "// This test is automatically generated due to execution failure",
  displayError: error2,
  attempts: [
    {
      state: "failed",
      startedAt: start,
      duration: 0,
      videoTimestamp: 0,
      screenshots: [],
      error: {
        name: "CypressExecutionError",
        message: error2,
        stack: "",
        codeFrame: null
      }
    }
  ]
});
function getFailedFakeInstanceResult(configState, {
  specs,
  error: error2
}) {
  const start = (/* @__PURE__ */ new Date()).toISOString();
  const end = (/* @__PURE__ */ new Date()).toISOString();
  return {
    // @ts-ignore
    config: configState.getConfig() ?? {},
    status: "finished",
    startedTestsAt: (/* @__PURE__ */ new Date()).toISOString(),
    endedTestsAt: (/* @__PURE__ */ new Date()).toISOString(),
    totalDuration: 0,
    totalSuites: 1,
    totalFailed: 1,
    totalPassed: 0,
    totalPending: 0,
    totalSkipped: 0,
    totalTests: 1,
    browserName: "unknown",
    browserVersion: "unknown",
    browserPath: "unknown",
    osName: "unknown",
    osVersion: "unknown",
    cypressVersion: "unknown",
    runs: specs.map((s) => ({
      stats: {
        suites: 1,
        tests: 1,
        passes: 0,
        pending: 0,
        skipped: 0,
        failures: 1,
        startedAt: start,
        endedAt: end,
        duration: 0
      },
      reporter: "spec",
      reporterStats: {
        suites: 1,
        tests: 1,
        passes: 0,
        pending: 0,
        failures: 1,
        start,
        end,
        duration: 0
      },
      hooks: [],
      error: error2,
      video: null,
      spec: {
        name: s,
        relative: s,
        absolute: s,
        relativeToCommonRoot: s,
        baseName: s,
        specType: "integration",
        fileExtension: "js",
        fileName: s,
        specFileExtension: "js"
      },
      tests: [getDummyFailedTest(start, error2)],
      shouldUploadVideo: false,
      skippedSpec: false
    }))
  };
}

// lib/results/summarize.ts
var summarizeExecution = (input, config) => {
  if (!input.length) {
    return ModuleAPIResults.getEmptyResult(config);
  }
  const overall = input.reduce(
    (acc, {
      totalDuration,
      totalFailed,
      totalPassed,
      totalPending,
      totalSkipped,
      totalTests,
      totalSuites
    }) => ({
      totalDuration: acc.totalDuration + totalDuration,
      totalSuites: acc.totalSuites + totalSuites,
      totalPending: acc.totalPending + totalPending,
      totalFailed: acc.totalFailed + totalFailed,
      totalSkipped: acc.totalSkipped + totalSkipped,
      totalPassed: acc.totalPassed + totalPassed,
      totalTests: acc.totalTests + totalTests
    }),
    emptyStats
  );
  const firstResult = input[0];
  const startItems = input.map((i) => i.startedTestsAt).sort();
  const endItems = input.map((i) => i.endedTestsAt).sort();
  const runs = input.map((i) => i.runs).flat();
  return {
    ...overall,
    runs,
    startedTestsAt: _9.first(startItems),
    endedTestsAt: _9.last(endItems),
    ..._9.pick(
      firstResult,
      "browserName",
      "browserVersion",
      "browserPath",
      "osName",
      "osVersion",
      "cypressVersion",
      "config"
    ),
    status: "finished"
  };
};

// lib/results/table.ts
import getCommonPathPrefix from "common-path-prefix";
import _10 from "lodash";
import path2 from "path";
import prettyMS from "pretty-ms";
import { table } from "table";
var failureIcon = red("\u2716");
var successIcon = green("\u2714");
var summaryTable = (r) => {
  const overallSpecCount = r.runs.length;
  const failedSpecsCount = _10.sum(
    r.runs.filter((v) => v.stats.failures + v.stats.skipped > 0).map(() => 1)
  );
  const hasFailed = failedSpecsCount > 0;
  const verdict = hasFailed ? red(`${failedSpecsCount} of ${overallSpecCount} failed`) : overallSpecCount > 0 ? "All specs passed!" : "No specs executed";
  const specs = r.runs.map((r2) => r2.spec.relative);
  const commonPath = getCommonPath(specs);
  const data = r.runs.map((r2) => [
    r2.stats.failures + r2.stats.skipped > 0 ? failureIcon : successIcon,
    stripCommonPath(r2.spec.relative, commonPath),
    gray(prettyMS(r2.stats.duration ?? 0)),
    white(r2.stats.tests ?? 0),
    r2.stats.passes ? green(r2.stats.passes) : gray("-"),
    r2.stats.failures ? red(r2.stats.failures) : gray("-"),
    r2.stats.pending ? cyan(r2.stats.pending) : gray("-"),
    r2.stats.skipped ? red(r2.stats.skipped) : gray("-")
  ]);
  return table(
    [
      [
        "",
        // marker
        gray("Spec"),
        "",
        gray("Tests"),
        gray("Passing"),
        gray("Failing"),
        gray("Pending"),
        gray("Skipped")
      ],
      ...data,
      [
        hasFailed ? failureIcon : successIcon,
        // marker
        verdict,
        gray(prettyMS(r.totalDuration ?? 0)),
        overallSpecCount > 0 ? white(r.totalTests ?? 0) : gray("-"),
        r.totalPassed ? green(r.totalPassed) : gray("-"),
        r.totalFailed ? red(r.totalFailed) : gray("-"),
        r.totalPending ? cyan(r.totalPending) : gray("-"),
        r.totalSkipped ? red(r.totalSkipped) : gray("-")
      ]
    ],
    {
      border,
      columnDefault: {
        width: 8
      },
      columns: [
        { alignment: "left", width: 2 },
        { alignment: "left", width: 30 },
        { alignment: "right" },
        { alignment: "right" },
        { alignment: "right" },
        { alignment: "right" },
        { alignment: "right" },
        { alignment: "right" }
      ],
      // singleLine: true,
      drawHorizontalLine: (lineIndex, rowCount) => {
        return lineIndex === 1 || lineIndex === 0 || lineIndex === rowCount - 1 || lineIndex === rowCount;
      },
      drawVerticalLine: (lineIndex, rowCount) => {
        return lineIndex === 0 || rowCount === lineIndex;
      }
    }
  );
};
var border = _10.mapValues(
  {
    topBody: `\u2500`,
    topJoin: `\u252C`,
    topLeft: `  \u250C`,
    topRight: `\u2510`,
    bottomBody: `\u2500`,
    bottomJoin: `\u2534`,
    bottomLeft: `  \u2514`,
    bottomRight: `\u2518`,
    bodyLeft: `  \u2502`,
    bodyRight: `\u2502`,
    bodyJoin: `\u2502`,
    joinBody: `\u2500`,
    joinLeft: `  \u251C`,
    joinRight: `\u2524`,
    joinJoin: `\u253C`
  },
  (v) => gray(v)
);
function getCommonPath(specs) {
  if (specs.length === 0) {
    return "";
  }
  if (specs.length === 1) {
    return path2.dirname(specs[0]) + path2.sep;
  }
  return getCommonPathPrefix(specs);
}
function stripCommonPath(spec, commonPath) {
  return spec.replace(commonPath, "");
}

// lib/results/uploadResults.ts
import Debug12 from "debug";

// lib/artifacts.ts
import Debug10 from "debug";

// lib/upload.ts
import Debug9 from "debug";
import fs3 from "fs";
var readFile = fs3.promises.readFile;
var debug11 = Debug9("currents:upload");
function uploadVideo(file2, url) {
  return uploadFile(file2, url, "video/mp4");
}
function uploadImage(file2, url) {
  return uploadFile(file2, url, "image/png");
}
function uploadJson(file2, url) {
  return uploadFile(file2, url, "application/json");
}
async function uploadFile(file2, url, type) {
  debug11('uploading file "%s" to "%s"', file2, url);
  const f = await readFile(file2);
  await makeRequest({
    url,
    method: "PUT",
    data: f,
    headers: {
      "Content-Type": type,
      "Content-Disposition": `inline`
    }
  });
}

// lib/artifacts.ts
var debug12 = Debug10("currents:artifacts");
async function uploadArtifacts({
  executionState,
  videoPath,
  videoUploadUrl,
  screenshots,
  screenshotUploadUrls,
  coverageFilePath,
  coverageUploadUrl
}) {
  debug12("uploading artifacts: %o", {
    videoPath,
    videoUploadUrl,
    screenshots,
    screenshotUploadUrls,
    coverageFilePath,
    coverageUploadUrl
  });
  const totalUploads = (videoPath ? 1 : 0) + screenshots.length + (coverageUploadUrl ? 1 : 0);
  if (totalUploads === 0) {
    return;
  }
  if (videoUploadUrl && videoPath) {
    await safe(
      uploadVideo,
      (e) => {
        debug12("failed uploading video %s. Error: %o", videoPath, e);
        executionState.addWarning(
          `Failed uploading video ${videoPath}.
${dim(e)}`
        );
      },
      () => debug12("success uploading", videoPath)
    )(videoPath, videoUploadUrl);
  }
  if (screenshotUploadUrls && screenshotUploadUrls.length) {
    await Promise.all(
      screenshots.map((screenshot) => {
        const url = screenshotUploadUrls.find(
          (urls) => urls.screenshotId === screenshot.screenshotId
        )?.uploadUrl;
        if (!url) {
          debug12(
            "No upload url for screenshot %o, screenshotUploadUrls: %o",
            screenshot,
            screenshotUploadUrls
          );
          executionState.addWarning(
            `No upload URL for screenshot ${screenshot.path}`
          );
          return Promise.resolve();
        }
        return safe(
          uploadImage,
          (e) => {
            debug12(
              "failed uploading screenshot %s. Error: %o",
              screenshot.path,
              e
            );
            executionState.addWarning(
              `Failed uploading screenshot ${screenshot.path}.
${dim(e)}`
            );
          },
          () => debug12("success uploading", screenshot.path)
        )(screenshot.path, url);
      })
    );
  }
  if (coverageUploadUrl && coverageFilePath) {
    await safe(
      uploadJson,
      (e) => {
        debug12(
          "failed uploading coverage file %s. Error: %o",
          coverageFilePath,
          e
        );
        executionState.addWarning(
          `Failed uploading coverage file ${coverageFilePath}.
${dim(e)}`
        );
      },
      () => debug12("success uploading", coverageFilePath)
    )(coverageFilePath, coverageUploadUrl);
  }
}
var uploadStdoutSafe = safe(
  updateInstanceStdout,
  () => {
  },
  () => {
  }
);

// lib/cancellation/cancellation.ts
var state = {
  cancellationReason: null
};
var setCancellationReason = (reason) => {
  if (state.cancellationReason) {
    return;
  }
  state.cancellationReason = reason;
  getPubSub().emit("run:cancelled" /* RUN_CANCELLED */, reason);
};

// lib/results/api.ts
import Debug11 from "debug";
var debug13 = Debug11("currents:results");
var getInstanceResultPayload = (runResult, coverageFilePath) => {
  debug13("generating instance result payload from %o", runResult);
  return {
    stats: StandardResultsToAPIResults.getStats(runResult.stats),
    reporterStats: runResult.reporterStats,
    exception: runResult.error ?? null,
    video: !!runResult.video,
    // Did the instance generate a video?
    screenshots: StandardResultsToAPIResults.getAllScreenshots(runResult),
    hasCoverage: !!coverageFilePath,
    tests: (runResult.tests ?? []).map(
      StandardResultsToAPIResults.getTestForResults
    )
  };
};
var getInstanceTestsPayload = (runResult, config) => {
  return {
    // @ts-ignore
    config: {
      ...config.getConfig(),
      // @ts-ignore
      videoUploadOnPasses: config.getConfig()?.videoUploadOnPasses ?? true
    },
    tests: (runResult.tests ?? []).map(
      StandardResultsToAPIResults.getTestForSetTests
    ),
    hooks: runResult.hooks
  };
};
var StandardResultsToAPIResults = class _StandardResultsToAPIResults {
  static getTestAttempt(attempt) {
    return {
      state: attempt.state,
      error: attempt.error,
      wallClockStartedAt: attempt.startedAt,
      wallClockDuration: attempt.duration,
      videoTimestamp: attempt.videoTimestamp
    };
  }
  static getTestForResults(test, index) {
    return {
      displayError: test.displayError,
      state: test.state,
      attempts: (test.attempts ?? []).map(
        _StandardResultsToAPIResults.getTestAttempt
      ),
      clientId: `r${index}`
    };
  }
  static getTestForSetTests(test, index) {
    return {
      body: "redacted",
      title: test.title,
      clientId: `r${index}`
    };
  }
  static getAllScreenshots(run3) {
    return (run3.tests ?? []).flatMap(
      (t, i) => t.attempts.flatMap(
        (a, j) => a.screenshots.map((s) => ({
          ...s,
          testId: `r${i}`,
          testAttemptIndex: j,
          screenshotId: getRandomString()
        }))
      )
    );
  }
  static getStats(stats) {
    return {
      ...stats,
      wallClockDuration: stats.duration,
      wallClockStartedAt: stats.startedAt,
      wallClockEndedAt: stats.endedAt
    };
  }
};

// lib/results/uploadResults.ts
var debug14 = Debug12("currents:results");
async function getReportResultsTask(instanceId, executionState, configState, stdout2, coverageFilePath) {
  const results = executionState.getInstanceResults(configState, instanceId);
  const run3 = results.runs[0];
  if (!run3) {
    throw new Error("No run found in Cypress results");
  }
  const instanceResults = getInstanceResultPayload(run3, coverageFilePath);
  const instanceTests = getInstanceTestsPayload(run3, configState);
  const { videoUploadUrl, screenshotUploadUrls, coverageUploadUrl, cloud } = await reportResults(instanceId, instanceTests, instanceResults);
  if (cloud?.shouldCancel) {
    debug14("instance %s should cancel", instanceId);
    setCancellationReason(cloud.shouldCancel);
  }
  debug14("instance %s artifact upload instructions %o", instanceId, {
    videoUploadUrl,
    screenshotUploadUrls,
    coverageUploadUrl
  });
  return Promise.all([
    uploadArtifacts({
      executionState,
      videoUploadUrl,
      videoPath: run3.video,
      screenshotUploadUrls,
      screenshots: instanceResults.screenshots,
      coverageUploadUrl,
      coverageFilePath
    }),
    uploadStdoutSafe(instanceId, getInitialOutput() + stdout2)
  ]);
}
async function reportResults(instanceId, instanceTests, instanceResults) {
  debug14("reporting instance %s results...", instanceId);
  if (isCurrents()) {
    return reportInstanceResultsMerged(instanceId, {
      tests: instanceTests,
      results: instanceResults
    });
  }
  await setInstanceTests(instanceId, instanceTests);
  return updateInstanceResults(instanceId, instanceResults);
}

// lib/runner/reportTask.ts
var debug15 = Debug13("currents:reportTask");
var reportTasks = [];
var createReportTask = (configState, executionState, instanceId) => {
  const instance = executionState.getInstance(instanceId);
  if (!instance) {
    error("Cannot find execution state for instance %s", instanceId);
    return;
  }
  if (instance.reportStartedAt) {
    debug15("Report task already created for instance %s", instanceId);
    return;
  }
  instance.reportStartedAt = /* @__PURE__ */ new Date();
  debug15("Creating report task for instanceId %s", instanceId);
  reportTasks.push(
    getReportResultsTask(
      instanceId,
      executionState,
      configState,
      instance.output ?? "no output captured",
      instance.coverageFilePath
    ).catch(error)
  );
};
var createReportTaskSpec = (configState, executionState, spec) => {
  const i = executionState.getSpec(spec);
  if (!i) {
    error("Cannot find execution state for spec %s", spec);
    return;
  }
  debug15("Creating report task for spec %s", spec);
  return createReportTask(configState, executionState, i.instanceId);
};

// lib/runner/runner.ts
var debug16 = Debug14("currents:runner");
async function runTillDone(executionState, configState, {
  runId,
  groupId,
  machineId,
  platform: platform2,
  specs: allSpecs
}, params) {
  let hasMore = true;
  while (hasMore) {
    const newTasks = await runBatch(executionState, configState, {
      runMeta: {
        runId,
        groupId,
        machineId,
        platform: platform2
      },
      allSpecs,
      params
    });
    if (!newTasks.length) {
      debug16("No more tasks to run. Uploads queue: %d", reportTasks.length);
      hasMore = false;
      break;
    }
    newTasks.forEach(
      (t) => createReportTask(configState, executionState, t.instanceId)
    );
  }
}
async function runBatch(executionState, configState, {
  runMeta,
  params,
  allSpecs
}) {
  let batch = {
    specs: [],
    claimedInstances: 0,
    totalInstances: 0
  };
  if (isCurrents()) {
    debug16("Getting batched tasks: %d", params.batchSize);
    batch = await createBatchedInstances({
      ...runMeta,
      batchSize: params.batchSize
    });
    debug16("Got batched tasks: %o", batch);
  } else {
    const response = await createInstance(runMeta);
    if (response.spec !== null && response.instanceId !== null) {
      batch.specs.push({
        spec: response.spec,
        instanceId: response.instanceId
      });
    }
    batch.claimedInstances = response.claimedInstances;
    batch.totalInstances = response.totalInstances;
  }
  if (batch.specs.length === 0) {
    return [];
  }
  batch.specs.forEach((i) => executionState.initInstance(i));
  divider();
  info(
    "Running: %s (%d/%d)",
    batch.specs.map((s) => s.spec).join(", "),
    batch.claimedInstances,
    batch.totalInstances
  );
  const batchedResult = await runSpecFileSafe(
    {
      // use absolute paths - user can run the program from a different directory, e.g. nx or a monorepo workspace
      // cypress still report the path relative to the project root
      spec: batch.specs.map((bs) => getSpecAbsolutePath(allSpecs, bs.spec)).join(",")
    },
    params
  );
  title("blue", "Reporting results and artifacts in background...");
  const output = getCapturedOutput();
  batch.specs.forEach((spec) => {
    executionState.setInstanceOutput(spec.instanceId, output);
    const singleSpecResult = getSingleSpecRunResult(spec.spec, batchedResult);
    if (!singleSpecResult) {
      return;
    }
    getPubSub().emit("run:result" /* RUN_RESULT */, {
      specRelative: spec.spec,
      instanceId: spec.instanceId,
      runResult: singleSpecResult
    });
  });
  resetCapture();
  return batch.specs;
}
function getSingleSpecRunResult(specRelative, batchedResult) {
  if (!ModuleAPIResults.isSuccessResult(batchedResult)) {
    return;
  }
  const run3 = batchedResult.runs.find((r) => r.spec.relative === specRelative);
  if (!run3) {
    return;
  }
  return {
    ...batchedResult,
    // @ts-ignore
    runs: [run3]
  };
}
function getSpecAbsolutePath(allSpecs, relative) {
  const absolutePath = allSpecs.find((i) => i.relative === relative)?.absolute;
  if (!absolutePath) {
    warn(
      'Cannot find absolute path for spec. Spec: "%s", candidates: %o',
      relative,
      allSpecs
    );
    throw new Error(`Cannot find absolute path for spec`);
  }
  return absolutePath;
}

// lib/runner/cancellable.ts
var cancellable = null;
function onRunCancelled(reason) {
  warn(
    `Run cancelled: %s. Waiting for uploads to complete and stopping execution...`,
    reason
  );
  cancellable?.cancel();
}
async function runTillDoneOrCancelled(...args) {
  return new Promise((_resolve, _reject) => {
    cancellable = new BPromise((resolve, reject, onCancel) => {
      if (!onCancel) {
        _reject(new Error("BlueBird is misconfigured: onCancel is undefined"));
        return;
      }
      onCancel(() => _resolve(void 0));
      runTillDone(...args).then(
        () => {
          resolve();
          _resolve(void 0);
        },
        (error2) => {
          reject();
          _reject(error2);
        }
      );
    });
    getPubSub().addListener("run:cancelled" /* RUN_CANCELLED */, onRunCancelled);
  }).finally(() => {
    getPubSub().removeListener("run:cancelled" /* RUN_CANCELLED */, onRunCancelled);
  });
}

// lib/results/captureHooks.ts
var debug17 = Debug15("currents:events");
function handleScreenshotEvent(screenshot, executionState) {
  const data = {
    ...screenshot,
    testId: executionState.getCurrentTestID(),
    height: screenshot.dimensions.height,
    width: screenshot.dimensions.width
  };
  executionState.addScreenshotsData(data);
}
function handleTestBefore(testAttempt, executionState) {
  const parsed = JSON.parse(testAttempt);
  executionState.setCurrentTestID(parsed.id);
}
function handleTestAfter(testAttempt, executionState) {
  const test = JSON.parse(testAttempt);
  executionState.addAttemptsData(test);
}
async function handleSpecAfter({
  executionState,
  configState,
  spec,
  results,
  experimentalCoverageRecording = false
}) {
  debug17("after:spec %s %o", spec.relative, results);
  executionState.setSpecAfter(
    spec.relative,
    SpecAfterResult.getSpecAfterStandard(results, executionState)
  );
  executionState.setSpecOutput(spec.relative, getCapturedOutput());
  const config = configState.getConfig();
  if (experimentalCoverageRecording) {
    const config2 = configState.getConfig();
    const { path: path5, error: error2 } = await getCoverageFilePath(
      config2?.env?.coverageFile
    );
    if (!error2) {
      executionState.setSpecCoverage(spec.relative, path5);
    } else {
      executionState.addWarning(
        `Error reading coverage file "${path5}". Coverage recording will be skipped.
${dim(
          error2
        )}`
      );
    }
  }
  createReportTaskSpec(configState, executionState, spec.relative);
}

// lib/listener.ts
var debug18 = Debug16("currents:events");
function listenToEvents(configState, executionState, experimentalCoverageRecording = false) {
  getPubSub().on(
    "run:result" /* RUN_RESULT */,
    ({
      instanceId,
      runResult,
      specRelative
    }) => {
      debug18("%s %s: %o", "run:result" /* RUN_RESULT */, instanceId, runResult);
      executionState.setInstanceResult(
        instanceId,
        ModuleAPIResults.getStandardResult(runResult, executionState)
      );
    }
  );
  getPubSub().on("test:after:run" /* TEST_AFTER_RUN */, (payload) => {
    debug18("%s %o", "test:after:run" /* TEST_AFTER_RUN */, payload);
    handleTestAfter(payload, executionState);
  });
  getPubSub().on("test:before:run" /* TEST_BEFORE_RUN */, (payload) => {
    debug18("%s %o", "test:before:run" /* TEST_BEFORE_RUN */, payload);
    handleTestBefore(payload, executionState);
  });
  getPubSub().on(
    "after:screenshot" /* AFTER_SCREENSHOT */,
    (screenshot) => {
      debug18("%s %o", "after:screenshot" /* AFTER_SCREENSHOT */, screenshot);
      handleScreenshotEvent(screenshot, executionState);
    }
  );
  getPubSub().on(
    "after:spec" /* AFTER_SPEC */,
    async ({
      spec,
      results
    }) => {
      await handleSpecAfter({
        spec,
        results,
        executionState,
        configState,
        experimentalCoverageRecording
      });
    }
  );
}

// lib/platform/browser.ts
import Debug17 from "debug";
var debug19 = Debug17("currents:browser");
function guessBrowser(browser, availableBrowsers = []) {
  debug19(
    "guessing browser from '%s', available browsers: %o",
    browser,
    availableBrowsers
  );
  let result = availableBrowsers.find((b) => b.name === browser);
  if (result) {
    debug19("identified browser by name: %o", result);
    return {
      browserName: result.displayName,
      browserVersion: result.version
    };
  }
  result = availableBrowsers.find((b) => b.path === browser);
  if (result) {
    debug19("identified browser by path: %o", result);
    return {
      browserName: result.displayName ?? result.name,
      browserVersion: result.version
    };
  }
  warn("Unable to identify browser name and version");
  return {
    browserName: "unknown",
    browserVersion: "unknown"
  };
}

// lib/platform/platform.ts
import Debug18 from "debug";
import getos from "getos";
import { cpus, freemem, platform, release, totalmem } from "os";
import { promisify } from "util";
var debug20 = Debug18("currents:platform");
var getOsVersion = async () => {
  if (platform() === "linux") {
    try {
      const linuxOs = await promisify(getos)();
      if ("dist" in linuxOs && "release" in linuxOs) {
        return [linuxOs.dist, linuxOs.release].join(" - ");
      } else {
        return release();
      }
    } catch {
      return release();
    }
  }
  return release();
};
var getPlatformInfo = async () => {
  const osVersion = await getOsVersion();
  const result = {
    osName: platform(),
    osVersion,
    osCpus: cpus(),
    osMemory: {
      free: freemem(),
      total: totalmem()
    }
  };
  debug20("platform info: %o", result);
  return result;
};

// lib/platform/index.ts
async function getPlatform({
  browser,
  config
}) {
  return {
    ...await getPlatformInfo(),
    ...guessBrowser(browser ?? "electron", config.resolved?.browsers)
  };
}

// lib/shutdown.ts
async function shutdown() {
  await stopWSS();
}

// lib/specMatcher/specMatcher.ts
import Debug19 from "debug";
import path4 from "path";
import commonPathPrefix from "common-path-prefix";
import globby from "globby";
import _11 from "lodash";
import os from "os";

// lib/utils.ts
import path3 from "path";
function toArray(val) {
  return val ? typeof val === "string" ? [val] : val : [];
}
function toPosix(file2, sep = path3.sep) {
  return file2.split(sep).join(path3.posix.sep);
}

// lib/specMatcher/specMatcher.ts
var debug21 = Debug19("currents:specs");
async function findSpecs({
  projectRoot,
  testingType,
  specPattern,
  configSpecPattern,
  excludeSpecPattern,
  additionalIgnorePattern
}) {
  configSpecPattern = toArray(configSpecPattern);
  specPattern = toArray(specPattern);
  excludeSpecPattern = toArray(excludeSpecPattern) || [];
  additionalIgnorePattern = toArray(additionalIgnorePattern) || [];
  debug21("exploring spec files for execution %O", {
    testingType,
    projectRoot,
    specPattern,
    configSpecPattern,
    excludeSpecPattern,
    additionalIgnorePattern
  });
  if (!specPattern || !configSpecPattern) {
    throw Error("Could not find glob patterns for exploring specs");
  }
  let specAbsolutePaths = await getFilesByGlob(projectRoot, specPattern, {
    absolute: true,
    ignore: [...excludeSpecPattern, ...additionalIgnorePattern]
  });
  if (!_11.isEqual(specPattern, configSpecPattern)) {
    const defaultSpecAbsolutePaths = await getFilesByGlob(
      projectRoot,
      configSpecPattern,
      {
        absolute: true,
        ignore: [...excludeSpecPattern, ...additionalIgnorePattern]
      }
    );
    specAbsolutePaths = _11.intersection(
      specAbsolutePaths,
      defaultSpecAbsolutePaths
    );
  }
  return matchedSpecs({
    projectRoot,
    testingType,
    specAbsolutePaths,
    specPattern
  });
}
async function getFilesByGlob(projectRoot, glob, globOptions) {
  const workingDirectoryPrefix = path4.join(projectRoot, path4.sep);
  const globs = [].concat(glob).map(
    (globPattern) => globPattern.startsWith("./") ? globPattern.replace("./", "") : globPattern
  ).map((globPattern) => {
    if (globPattern.startsWith(workingDirectoryPrefix)) {
      return globPattern.replace(workingDirectoryPrefix, "");
    }
    return globPattern;
  });
  if (os.platform() === "win32") {
    debug21("updating glob patterns to POSIX");
    for (const i in globs) {
      const cur = globs[i];
      if (!cur)
        throw new Error("undefined glob received");
      globs[i] = toPosix(cur);
    }
  }
  try {
    debug21("globbing pattern(s): %o", globs);
    debug21("within directory: %s", projectRoot);
    return matchGlobs(globs, {
      onlyFiles: true,
      absolute: true,
      cwd: projectRoot,
      ...globOptions,
      ignore: (globOptions?.ignore ?? []).concat("**/node_modules/**")
    });
  } catch (e) {
    debug21("error in getFilesByGlob %o", e);
    return [];
  }
}
var matchGlobs = async (globs, globbyOptions) => {
  return await globby(globs, globbyOptions);
};
function matchedSpecs({
  projectRoot,
  testingType,
  specAbsolutePaths
}) {
  debug21("found specs %o", specAbsolutePaths);
  let commonRoot = "";
  if (specAbsolutePaths.length === 1) {
    commonRoot = path4.dirname(specAbsolutePaths[0]);
  } else {
    commonRoot = commonPathPrefix(specAbsolutePaths);
  }
  return specAbsolutePaths.map(
    (absolute) => transformSpec({
      projectRoot,
      absolute,
      testingType,
      commonRoot,
      platform: os.platform(),
      sep: path4.sep
    })
  );
}
function transformSpec({
  projectRoot,
  absolute,
  testingType,
  commonRoot,
  platform: platform2,
  sep
}) {
  if (platform2 === "win32") {
    absolute = toPosix(absolute, sep);
    projectRoot = toPosix(projectRoot, sep);
  }
  const relative = path4.relative(projectRoot, absolute);
  const parsedFile = path4.parse(absolute);
  const fileExtension = path4.extname(absolute);
  const specFileExtension = [".spec", ".test", "-spec", "-test", ".cy"].map((ext) => ext + fileExtension).find((ext) => absolute.endsWith(ext)) || fileExtension;
  const parts = absolute.split(projectRoot);
  let name = parts[parts.length - 1] || "";
  if (name.startsWith("/")) {
    name = name.slice(1);
  }
  const LEADING_SLASH = /^\/|/g;
  const relativeToCommonRoot = absolute.replace(commonRoot, "").replace(LEADING_SLASH, "");
  return {
    fileExtension,
    baseName: parsedFile.base,
    fileName: parsedFile.base.replace(specFileExtension, ""),
    specFileExtension,
    relativeToCommonRoot,
    specType: testingType === "component" ? "component" : "integration",
    name,
    relative,
    absolute
  };
}

// lib/specMatcher/getSpecFiles.ts
var getSpecFiles = async ({
  config,
  params
}) => {
  const specPattern = getSpecPattern(config.specPattern, params.spec);
  const specs = await findSpecs({
    // https://docs.cypress.io/guides/guides/command-line#cypress-run-spec-lt-spec-gt
    projectRoot: params.project ?? config.projectRoot,
    testingType: params.testingType,
    specPattern,
    configSpecPattern: config.specPattern,
    excludeSpecPattern: config.excludeSpecPattern,
    additionalIgnorePattern: config.additionalIgnorePattern
  });
  if (specs.length === 0) {
    warn(
      "Found no spec files. Was looking for spec files that match both configSpecPattern and specPattern relative to projectRoot. Configuration: %O",
      {
        projectRoot: config.projectRoot,
        specPattern,
        configSpecPattern: config.specPattern,
        excludeSpecPattern: [
          config.excludeSpecPattern,
          config.additionalIgnorePattern
        ].flat(2),
        testingType: params.testingType
      }
    );
  }
  return { specs, specPattern };
};
function getSpecPattern(configPattern, explicit) {
  return explicit || configPattern;
}

// lib/state/config.ts
var ConfigState = class {
  constructor() {
    this._config = void 0;
  }
  setConfig(c) {
    this._config = c;
  }
  getConfig() {
    return this._config;
  }
};

// lib/results/mapResult.ts
var SpecAfterToModuleAPIMapper = class _SpecAfterToModuleAPIMapper {
  static getTestAttempt(attempt, screenshots) {
    return {
      ...attempt,
      duration: attempt.wallClockDuration,
      startedAt: attempt.wallClockStartedAt,
      screenshots
    };
  }
  static getTest(t, screenshots) {
    return {
      ...t,
      attempts: t.attempts.map(
        (a, i) => _SpecAfterToModuleAPIMapper.getTestAttempt(
          a,
          screenshots.filter(
            (s) => s.testId === t.testId && s.testAttemptIndex === i
          )
        )
      )
    };
  }
  static convert(specAfterResult, configState) {
    const stats = {
      duration: specAfterResult.stats.wallClockDuration,
      endedAt: specAfterResult.stats.wallClockEndedAt,
      startedAt: specAfterResult.stats.wallClockStartedAt,
      failures: specAfterResult.stats.failures ?? 0,
      passes: specAfterResult.stats.passes ?? 0,
      pending: specAfterResult.stats.pending ?? 0,
      skipped: specAfterResult.stats.skipped ?? 0,
      suites: specAfterResult.stats.suites ?? 0,
      tests: specAfterResult.stats.tests ?? 0
    };
    return {
      status: "finished",
      // @ts-ignore
      config: configState.getConfig(),
      totalDuration: stats.duration,
      totalSuites: stats.suites,
      totalTests: stats.tests,
      totalFailed: stats.failures,
      totalPassed: stats.passes,
      totalPending: stats.pending,
      totalSkipped: stats.skipped ?? 0,
      startedTestsAt: stats.startedAt,
      endedTestsAt: stats.endedAt,
      runs: [
        {
          stats,
          reporter: specAfterResult.reporter,
          reporterStats: specAfterResult.reporterStats ?? null,
          spec: specAfterResult.spec,
          error: specAfterResult.error,
          video: specAfterResult.video,
          // @ts-ignore
          shouldUploadVideo: true,
          // not really used
          // @ts-ignore
          // wrong typedef for CypressCommandLine.CypressRunResult
          // actual HookName is "before all" | "before each" | "after all" | "after each"
          hooks: specAfterResult.hooks,
          tests: (specAfterResult.tests ?? []).map(
            (t) => _SpecAfterToModuleAPIMapper.getTest(t, specAfterResult.screenshots)
          )
        }
      ]
    };
  }
  static backfillException(result) {
    return {
      ...result,
      runs: result.runs.map(_SpecAfterToModuleAPIMapper.backfillExceptionRun)
    };
  }
  static backfillExceptionRun(run3) {
    if (!run3.error) {
      return run3;
    }
    return {
      ...run3,
      tests: [getFakeTestFromException(run3.error, run3.stats)]
    };
  }
};
function getFakeTestFromException(error2, stats) {
  return {
    title: ["Unknown"],
    body: "",
    displayError: error2.split("\n")[0],
    state: "failed",
    attempts: [
      {
        state: "failed",
        duration: 0,
        error: {
          name: "Error",
          message: error2.split("\n")[0],
          stack: error2,
          codeFrame: null
        },
        screenshots: [],
        startedAt: stats.startedAt,
        videoTimestamp: 0
      }
    ]
  };
}

// lib/state/execution.ts
import Debug20 from "debug";
var debug22 = Debug20("currents:state");
var ExecutionState = class {
  constructor() {
    this.warnings = /* @__PURE__ */ new Set();
    this.attemptsData = [];
    this.screenshotsData = [];
    this.state = {};
  }
  getWarnings() {
    return this.warnings;
  }
  addWarning(warning) {
    this.warnings.add(warning);
  }
  getResults(configState) {
    return Object.values(this.state).map(
      (i) => this.getInstanceResults(configState, i.instanceId)
    );
  }
  getInstance(instanceId) {
    return this.state[instanceId];
  }
  getSpec(spec) {
    return Object.values(this.state).find((i) => i.spec === spec);
  }
  initInstance({
    instanceId,
    spec
  }) {
    debug22('Init execution state for "%s"', spec);
    this.state[instanceId] = {
      instanceId,
      spec,
      createdAt: /* @__PURE__ */ new Date()
    };
  }
  setSpecBefore(spec) {
    const i = this.getSpec(spec);
    if (!i) {
      warn('Cannot find execution state for spec "%s"', spec);
      return;
    }
    i.specBefore = /* @__PURE__ */ new Date();
  }
  setSpecCoverage(spec, coverageFilePath) {
    const i = this.getSpec(spec);
    if (!i) {
      warn('Cannot find execution state for spec "%s"', spec);
      return;
    }
    debug22("Experimental: coverageFilePath was set");
    i.coverageFilePath = coverageFilePath;
  }
  setSpecAfter(spec, results) {
    const i = this.getSpec(spec);
    if (!i) {
      warn('Cannot find execution state for spec "%s"', spec);
      return;
    }
    i.specAfter = /* @__PURE__ */ new Date();
    i.specAfterResults = results;
  }
  setSpecOutput(spec, output) {
    const i = this.getSpec(spec);
    if (!i) {
      warn('Cannot find execution state for spec "%s"', spec);
      return;
    }
    this.setInstanceOutput(i.instanceId, output);
  }
  setInstanceOutput(instanceId, output) {
    const i = this.state[instanceId];
    if (!i) {
      warn('Cannot find execution state for instance "%s"', instanceId);
      return;
    }
    if (i.output) {
      debug22('Instance "%s" already has output', instanceId);
      return;
    }
    i.output = output;
  }
  setInstanceResult(instanceId, runResults) {
    const i = this.state[instanceId];
    if (!i) {
      warn('Cannot find execution state for instance "%s"', instanceId);
      return;
    }
    i.runResults = {
      ...runResults,
      status: "finished"
    };
    i.runResultsReportedAt = /* @__PURE__ */ new Date();
  }
  getInstanceResults(configState, instanceId) {
    const i = this.getInstance(instanceId);
    if (!i) {
      error('Cannot find execution state for instance "%s"', instanceId);
      return getFailedFakeInstanceResult(configState, {
        specs: ["unknown"],
        error: `[currents] Error while processing cypress results for instance ${instanceId}. See the console output for details.`
      });
    }
    if (i.specAfterResults) {
      debug22('Using spec:after results for %s "%s"', instanceId, i.spec);
      return SpecAfterToModuleAPIMapper.backfillException(
        SpecAfterToModuleAPIMapper.convert(i.specAfterResults, configState)
      );
    }
    if (i.runResults) {
      debug22('Using runResults for %s "%s"', instanceId, i.spec);
      return SpecAfterToModuleAPIMapper.backfillException(i.runResults);
    }
    debug22('No results detected for "%s"', i.spec);
    return getFailedFakeInstanceResult(configState, {
      specs: [i.spec],
      error: `No results detected for the spec file. That usually happens because of cypress crash. See the console output for details.`
    });
  }
  addAttemptsData(attemptDetails) {
    this.attemptsData.push(attemptDetails);
  }
  getAttemptsData() {
    return this.attemptsData;
  }
  addScreenshotsData(screenshotsData) {
    this.screenshotsData.push(screenshotsData);
  }
  getScreenshotsData() {
    return this.screenshotsData;
  }
  setCurrentTestID(testID) {
    this.currentTestID = testID;
  }
  getCurrentTestID() {
    return this.currentTestID;
  }
};

// lib/warnings.ts
import chalk2 from "chalk";
import plur from "plur";
function printWarnings2(executionState) {
  const warnings = Array.from(executionState.getWarnings());
  if (warnings.length > 0) {
    warn(
      `${warnings.length} ${plur(
        "Warning",
        warnings.length
      )} encountered during the execution:
${warnings.map(
        (w, i) => `
${chalk2.yellow(`[${i + 1}/${warnings.length}]`)} ${w}`
      ).join("\n")}`
    );
  }
}

// lib/run.ts
var debug23 = Debug21("currents:run");
async function run(params = {}) {
  const executionState = new ExecutionState();
  const configState = new ConfigState();
  activateDebug(params.cloudDebug);
  debug23("run params %o", params);
  params = preprocessParams(params);
  debug23("params after preprocess %o", params);
  if (isOffline(params)) {
    info(`Skipping cloud orchestration because --record is set to false`);
    return runBareCypress(params);
  }
  const validatedParams = await validateParams(params);
  setAPIBaseUrl(validatedParams.cloudServiceUrl);
  if (!isCurrents()) {
    console.log(getLegalNotice());
  }
  const {
    recordKey,
    projectId,
    group,
    parallel,
    ciBuildId,
    tag,
    testingType,
    batchSize,
    autoCancelAfterFailures,
    experimentalCoverageRecording
  } = validatedParams;
  const config = await getMergedConfig(validatedParams);
  configState.setConfig(config?.resolved);
  const { specs, specPattern } = await getSpecFiles({
    config,
    params: validatedParams
  });
  if (specs.length === 0) {
    return;
  }
  const platform2 = await getPlatform({
    config,
    browser: validatedParams.browser
  });
  info(`Cypress-cloud version: ${dim(_currentsVersion)}`);
  info(`Cypress version: ${dim(_cypressVersion)}`);
  info("Discovered %d spec files", specs.length);
  info(
    `Tags: ${tag.length > 0 ? tag.join(",") : false}; Group: ${group ?? false}; Parallel: ${parallel ?? false}; Batch Size: ${batchSize}`
  );
  info("Connecting to cloud orchestration service...");
  const run3 = await createRun({
    ci: getCI(ciBuildId),
    specs: specs.map((spec) => spec.relative),
    commit: await getGitInfo(config.projectRoot),
    group,
    platform: platform2,
    parallel: parallel ?? false,
    ciBuildId,
    projectId,
    recordKey,
    specPattern: [specPattern].flat(2),
    tags: tag,
    testingType,
    batchSize,
    autoCancelAfterFailures,
    coverageEnabled: experimentalCoverageRecording
  });
  setRunId(run3.runId);
  info("\u{1F3A5} Run URL:", bold(run3.runUrl));
  cutInitialOutput();
  await startWSS();
  listenToEvents(
    configState,
    executionState,
    config.experimentalCoverageRecording
  );
  await runTillDoneOrCancelled(
    executionState,
    configState,
    {
      runId: run3.runId,
      groupId: run3.groupId,
      machineId: run3.machineId,
      platform: platform2,
      specs
    },
    validatedParams
  );
  divider();
  await Promise.allSettled(reportTasks);
  const _summary = summarizeExecution(
    executionState.getResults(configState),
    config
  );
  title("white", "Cloud Run Finished");
  console.log(summaryTable(_summary));
  printWarnings2(executionState);
  info("\n\u{1F3C1} Recorded Run:", bold(run3.runUrl));
  await shutdown();
  spacer();
  return {
    ..._summary,
    runUrl: run3.runUrl
  };
}

// index.ts
function run2(params) {
  return run(params);
}
export {
  run2 as run
};
/*! @preserve

### MIT

Parts of this code was copied from https://github.com/cypress-io/cypress and is subject to MIT license.

MIT License

Copyright (c) 2022 Cypress.io

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vaW5kZXgudHMiLCAiLi4vbGliL3JlcXVpcmUudHMiLCAiLi4vbGliL3N0ZG91dC50cyIsICIuLi9saWIvd3Mvd3MudHMiLCAiLi4vbGliL3B1YnN1Yi9ldmVudHMudHMiLCAiLi4vbGliL3B1YnN1Yi9wdWJzdWIudHMiLCAiLi4vbGliL2NhcHR1cmUudHMiLCAiLi4vbGliL3N0YXRlL2dsb2JhbC50cyIsICIuLi9saWIvaW5pdC50cyIsICIuLi9saWIvcnVuLnRzIiwgIi4uL2xlZ2FsLnRzIiwgIi4uL2xpYi9odHRwQ2xpZW50L2NvbmZpZy50cyIsICIuLi9saWIvaHR0cENsaWVudC9odHRwQ2xpZW50LnRzIiwgIi4uL2xpYi9jb25maWcvY29uZmlnLnRzIiwgIi4uL2xpYi9ib290c3RyYXAvYm9vdHN0cmFwLnRzIiwgIi4uL2xpYi9lcnJvcnMudHMiLCAiLi4vbGliL2ZzLnRzIiwgIi4uL2xpYi9sb2cudHMiLCAiLi4vbGliL2Jvb3RzdHJhcC9zZXJpYWxpemVyLnRzIiwgIi4uL2xpYi9kZWJ1Zy9pbmRleC50cyIsICIuLi9saWIvbGFuZy50cyIsICIuLi9saWIvbmFuby50cyIsICIuLi9saWIvY29uZmlnL3BhdGgudHMiLCAiLi4vbGliL2NvbmZpZy9wYXJhbXMudHMiLCAiLi4vbGliL2h0dHBDbGllbnQvcHJpbnRFcnJvcnMudHMiLCAiLi4vbGliL2FwaS93YXJuaW5ncy50cyIsICIuLi9saWIvYXBpL2FwaS50cyIsICIuLi9saWIvY2lQcm92aWRlci50cyIsICIuLi9saWIvY3lwcmVzcy9jeXByZXNzLnRzIiwgIi4uL2xpYi9yZXN1bHRzL21vZHVsZUFQSVJlc3VsdC50cyIsICIuLi9saWIvcmVzdWx0cy9zcGVjQWZ0ZXJSZXN1bHQudHMiLCAiLi4vbGliL2Vudi50cyIsICIuLi9saWIvZ2l0LnRzIiwgIi4uL2xpYi9saXN0ZW5lci50cyIsICIuLi9saWIvcmVzdWx0cy9jYXB0dXJlSG9va3MudHMiLCAiLi4vbGliL2NvdmVyYWdlL2luZGV4LnRzIiwgIi4uL2xpYi9ydW5uZXIvcnVubmVyLnRzIiwgIi4uL2xpYi9ydW5uZXIvcmVwb3J0VGFzay50cyIsICIuLi9saWIvcmVzdWx0cy9zdW1tYXJpemUudHMiLCAiLi4vbGliL3Jlc3VsdHMvZW1wdHkudHMiLCAiLi4vbGliL3Jlc3VsdHMvdGFibGUudHMiLCAiLi4vbGliL3Jlc3VsdHMvdXBsb2FkUmVzdWx0cy50cyIsICIuLi9saWIvYXJ0aWZhY3RzLnRzIiwgIi4uL2xpYi91cGxvYWQudHMiLCAiLi4vbGliL2NhbmNlbGxhdGlvbi9jYW5jZWxsYXRpb24udHMiLCAiLi4vbGliL3Jlc3VsdHMvYXBpLnRzIiwgIi4uL2xpYi9ydW5uZXIvY2FuY2VsbGFibGUudHMiLCAiLi4vbGliL3BsYXRmb3JtL2Jyb3dzZXIudHMiLCAiLi4vbGliL3BsYXRmb3JtL3BsYXRmb3JtLnRzIiwgIi4uL2xpYi9wbGF0Zm9ybS9pbmRleC50cyIsICIuLi9saWIvc2h1dGRvd24udHMiLCAiLi4vbGliL3NwZWNNYXRjaGVyL3NwZWNNYXRjaGVyLnRzIiwgIi4uL2xpYi91dGlscy50cyIsICIuLi9saWIvc3BlY01hdGNoZXIvZ2V0U3BlY0ZpbGVzLnRzIiwgIi4uL2xpYi9zdGF0ZS9jb25maWcudHMiLCAiLi4vbGliL3Jlc3VsdHMvbWFwUmVzdWx0LnRzIiwgIi4uL2xpYi9zdGF0ZS9leGVjdXRpb24udHMiLCAiLi4vbGliL3dhcm5pbmdzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLy8gPHJlZmVyZW5jZSB0eXBlcz1cImN5cHJlc3NcIiAvPlxuaW1wb3J0IFwic291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyLmpzXCI7XG5cbmltcG9ydCB7IHJ1biBhcyBpbnRlcm5hbFJ1biB9IGZyb20gXCIuL2xpYi9ydW5cIjtcbmltcG9ydCB7IEN1cnJlbnRzUnVuQVBJIH0gZnJvbSBcIi4vdHlwZXNcIjtcbmV4cG9ydCB0eXBlIHsgQ3VycmVudHNSdW5BUEkgfSBmcm9tIFwiLi90eXBlc1wiO1xuLyoqXG4gKiBSdW4gQ3lwcmVzcyB0ZXN0cyB3aXRoIGEgY2xvdWQgc2VydmljZSBvZiB5b3VyIGNob2ljZSBhbmQgcmV0dXJuIHRoZSByZXN1bHRzXG4gKlxuICogQGF1Z21lbnRzIEN1cnJlbnRzUnVuQVBJXG4gKiBAcmV0dXJucyB7Q3lwcmVzc0NvbW1hbmRMaW5lLkN5cHJlc3NSdW5SZXN1bHQgfCBDeXByZXNzQ29tbWFuZExpbmUuQ3lwcmVzc0ZhaWxlZFJ1blJlc3VsdCB8IHVuZGVmaW5lZH0gVGhlIHRlc3QgcmVzdWx0cywgb3IgdW5kZWZpbmVkIGlmIG5vIHRlc3RzIHdlcmUgcnVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBydW4ocGFyYW1zPzogQ3VycmVudHNSdW5BUEkpIHtcbiAgcmV0dXJuIGludGVybmFsUnVuKHBhcmFtcyk7XG59XG4iLCAiaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gXCJtb2R1bGVcIjtcbi8vIHJlcXVpcmVzIHNoaW09dHJ1ZSBpbiBwYWNrYWdlLmpzb25cbmV4cG9ydCBjb25zdCByZXF1aXJlID0gY3JlYXRlUmVxdWlyZShpbXBvcnQubWV0YS51cmwpO1xuIiwgImltcG9ydCBjcCBmcm9tIFwiY2hpbGRfcHJvY2Vzc1wiO1xuY29uc3Qgb3JnaW5hbCA9IGNwLnNwYXduO1xuXG4vLyBAdHMtaWdub3JlXG5jcC5zcGF3biA9IGZ1bmN0aW9uIChjb21tYW5kLCBhcmdzLCBvcHRpb25zKSB7XG4gIC8vIEB0cy1pZ25vcmVcbiAgaWYgKGNvbW1hbmQubWF0Y2goL0N5cHJlc3MvKSkge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBwcm9jZXNzID0gb3JnaW5hbChjb21tYW5kLCBhcmdzLCB7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgLy8gdXNpbmcgcGlwZSBlbmFibGVzIGNhcHR1cmluZyBzdGRvdXQgYW5kIHN0ZGVyclxuICAgICAgc3RkaW86IFtcInBpcGVcIiwgXCJwaXBlXCIsIFwicGlwZVwiXSxcbiAgICB9KTtcbiAgICByZXR1cm4gcHJvY2VzcztcbiAgfVxuXG4gIC8vIEB0cy1pZ25vcmVcbiAgcmV0dXJuIG9yZ2luYWwoY29tbWFuZCwgYXJncywgb3B0aW9ucyk7XG59O1xuIiwgImltcG9ydCBEZWJ1ZyBmcm9tIFwiZGVidWdcIjtcbmltcG9ydCBodHRwIGZyb20gXCJodHRwXCI7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgSHR0cFRlcm1pbmF0b3IgZnJvbSBcImxpbC1odHRwLXRlcm1pbmF0b3JcIjtcbmltcG9ydCB7IG1hdGNoLCBQIH0gZnJvbSBcInRzLXBhdHRlcm5cIjtcbmltcG9ydCAqIGFzIFdlYlNvY2tldCBmcm9tIFwid3NcIjtcbmltcG9ydCB7IGdldFB1YlN1YiB9IGZyb20gXCIuLi9wdWJzdWJcIjtcblxuY29uc3QgZGVidWcgPSBEZWJ1ZyhcImN1cnJlbnRzOndzXCIpO1xuXG5sZXQgc2VydmVyOiBodHRwLlNlcnZlciB8IG51bGwgPSBudWxsO1xubGV0IHdzczogV2ViU29ja2V0LlNlcnZlciB8IG51bGwgPSBudWxsO1xubGV0IGh0dHBUZXJtaW5hdG9yOiBIdHRwVGVybWluYXRvciB8IG51bGwgPSBudWxsO1xuXG5leHBvcnQgY29uc3QgZ2V0V1NTUG9ydCA9ICgpID0+XG4gIG1hdGNoKHNlcnZlcj8uYWRkcmVzcygpKVxuICAgIC53aXRoKHsgcG9ydDogUC5udW1iZXIgfSwgKGFkZHJlc3MpID0+IGFkZHJlc3MucG9ydClcbiAgICAub3RoZXJ3aXNlKCgpID0+IDApO1xuXG5leHBvcnQgY29uc3Qgc3RvcFdTUyA9IGFzeW5jICgpID0+IHtcbiAgZGVidWcoXCJ0ZXJtaW5hdGluZyB3c3Mgc2VydmVyOiAlZFwiLCBnZXRXU1NQb3J0KCkpO1xuICBpZiAoIWh0dHBUZXJtaW5hdG9yKSB7XG4gICAgZGVidWcoXCJubyB3c3Mgc2VydmVyXCIpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB7IHN1Y2Nlc3MsIGNvZGUsIG1lc3NhZ2UsIGVycm9yIH0gPSBhd2FpdCBodHRwVGVybWluYXRvci50ZXJtaW5hdGUoKTtcbiAgaWYgKCFzdWNjZXNzKSB7XG4gICAgaWYgKGNvZGUgPT09IFwiVElNRURfT1VUXCIpIGVycm9yKG1lc3NhZ2UpO1xuICAgIGlmIChjb2RlID09PSBcIlNFUlZFUl9FUlJPUlwiKSBlcnJvcihtZXNzYWdlLCBlcnJvcik7XG4gICAgaWYgKGNvZGUgPT09IFwiSU5URVJOQUxfRVJST1JcIikgZXJyb3IobWVzc2FnZSwgZXJyb3IpO1xuICB9XG4gIGRlYnVnKFwidGVybWluYXRlZCB3c3Mgc2VydmVyOiAlZFwiLCBnZXRXU1NQb3J0KCkpO1xufTtcbmV4cG9ydCBjb25zdCBzdGFydFdTUyA9ICgpID0+IHtcbiAgaWYgKHdzcykge1xuICAgIHJldHVybjtcbiAgfVxuICBzZXJ2ZXIgPSBodHRwXG4gICAgLmNyZWF0ZVNlcnZlcigpXG4gICAgLm9uKFwibGlzdGVuaW5nXCIsICgpID0+IHtcbiAgICAgIGlmICghc2VydmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNlcnZlciBub3QgaW5pdGlhbGl6ZWRcIik7XG4gICAgICB9XG4gICAgICB3c3MgPSBuZXcgV2ViU29ja2V0LldlYlNvY2tldFNlcnZlcih7XG4gICAgICAgIHNlcnZlcixcbiAgICAgIH0pO1xuICAgICAgZGVidWcoXCJzdGFydGluZyB3c3Mgb24gcG9ydCAlZFwiLCBnZXRXU1NQb3J0KCkpO1xuICAgICAgd3NzLm9uKFwiY29ubmVjdGlvblwiLCBmdW5jdGlvbiBjb25uZWN0aW9uKHdzKSB7XG4gICAgICAgIHdzLm9uKFwibWVzc2FnZVwiLCBmdW5jdGlvbiBpbmNvbWluZyhldmVudCkge1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LnRvU3RyaW5nKCkpO1xuICAgICAgICAgIGdldFB1YlN1YigpLmVtaXQobWVzc2FnZS50eXBlLCBtZXNzYWdlLnBheWxvYWQpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pXG4gICAgLmxpc3RlbigpO1xuXG4gIGh0dHBUZXJtaW5hdG9yID0gSHR0cFRlcm1pbmF0b3Ioe1xuICAgIHNlcnZlcixcbiAgfSk7XG59O1xuIiwgImV4cG9ydCBlbnVtIEV2ZW50IHtcbiAgUlVOX0NBTkNFTExFRCA9IFwicnVuOmNhbmNlbGxlZFwiLFxuICBSVU5fUkVTVUxUID0gXCJydW46cmVzdWx0XCIsXG4gIFRFU1RfQUZURVJfUlVOID0gXCJ0ZXN0OmFmdGVyOnJ1blwiLFxuICBURVNUX0JFRk9SRV9SVU4gPSBcInRlc3Q6YmVmb3JlOnJ1blwiLFxuICBBRlRFUl9TQ1JFRU5TSE9UID0gXCJhZnRlcjpzY3JlZW5zaG90XCIsXG4gIEFGVEVSX1NQRUMgPSBcImFmdGVyOnNwZWNcIixcbn1cbmV4cG9ydCBjb25zdCBhbGxFdmVudHMgPSBPYmplY3QudmFsdWVzKEV2ZW50KTtcbiIsICJpbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gXCJldmVudHNcIjtcblxubGV0IF9wdWJzdWI6IEV2ZW50RW1pdHRlciB8IG51bGwgPSBudWxsO1xuZXhwb3J0IGNvbnN0IGdldFB1YlN1YiA9ICgpID0+IHtcbiAgaWYgKCFfcHVic3ViKSB7XG4gICAgX3B1YnN1YiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgfVxuICByZXR1cm4gX3B1YnN1Yjtcbn07XG4iLCAiaW1wb3J0IERlYnVnIGZyb20gXCJkZWJ1Z1wiO1xuY29uc3QgZGVidWcgPSBEZWJ1ZyhcImN1cnJlbnRzOmNhcHR1cmVcIik7XG5cbmNvbnN0IF93cml0ZSA9IHByb2Nlc3Muc3Rkb3V0LndyaXRlO1xuY29uc3QgX2xvZyA9IHByb2Nlc3MubG9nO1xuXG5leHBvcnQgY29uc3QgcmVzdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gcmVzdG9yZSB0byB0aGUgb3JpZ2luYWxzXG4gIHByb2Nlc3Muc3Rkb3V0LndyaXRlID0gX3dyaXRlO1xuICBwcm9jZXNzLmxvZyA9IF9sb2c7XG59O1xuXG5jb25zdCBsb2dzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fTtcblxuY29uc3Qgc3Rkb3V0ID0gZnVuY3Rpb24gKCkge1xuICBkZWJ1ZyhcImNhcHR1cmluZyBzdGRvdXRcIik7XG4gIGxldCBsb2dzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8vIGxhemlseSBiYWNrdXAgd3JpdGUgdG8gZW5hYmxlIGluamVjdGlvblxuICBjb25zdCB7IHdyaXRlIH0gPSBwcm9jZXNzLnN0ZG91dDtcbiAgY29uc3QgeyBsb2cgfSA9IHByb2Nlc3M7XG5cbiAgLy8gZWxlY3Ryb24gYWRkcyBhIG5ldyBwcm9jZXNzLmxvZ1xuICAvLyBtZXRob2QgZm9yIHdpbmRvd3MgaW5zdGVhZCBvZiBwcm9jZXNzLnN0ZG91dC53cml0ZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vY3lwcmVzcy1pby9jeXByZXNzL2lzc3Vlcy85NzdcbiAgaWYgKGxvZykge1xuICAgIHByb2Nlc3MubG9nID0gZnVuY3Rpb24gKHN0cjogc3RyaW5nKSB7XG4gICAgICBsb2dzLnB1c2goc3RyKTtcblxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1yZXN0LXBhcmFtc1xuICAgICAgcmV0dXJuIGxvZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBwcm9jZXNzLnN0ZG91dC53cml0ZSA9IGZ1bmN0aW9uIChzdHI6IHN0cmluZykge1xuICAgIGxvZ3MucHVzaChzdHIpO1xuXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItcmVzdC1wYXJhbXNcbiAgICByZXR1cm4gd3JpdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgcmV0dXJuIGxvZ3Muam9pbihcIlwiKTtcbiAgICB9LFxuICAgIGRhdGE6IGxvZ3MsXG4gICAgcmVzdG9yZSxcbiAgICByZXNldDogKCkgPT4ge1xuICAgICAgZGVidWcoXCJyZXNldHRpbmcgY2FwdHVyZWQgc3Rkb3V0XCIpO1xuICAgICAgbG9ncyA9IFtdO1xuICAgIH0sXG4gIH07XG59O1xuXG5sZXQgaW5pdGlhbE91dHB1dDogc3RyaW5nID0gXCJcIjtcbmxldCBjYXB0dXJlZE91dHB1dDogbnVsbCB8IFJldHVyblR5cGU8dHlwZW9mIHN0ZG91dD4gPSBudWxsO1xuXG5leHBvcnQgY29uc3QgaW5pdENhcHR1cmUgPSAoKSA9PiAoY2FwdHVyZWRPdXRwdXQgPSBzdGRvdXQoKSk7XG5cbmV4cG9ydCBjb25zdCBjdXRJbml0aWFsT3V0cHV0ID0gKCkgPT4ge1xuICBpZiAoIWNhcHR1cmVkT3V0cHV0KSB0aHJvdyBuZXcgRXJyb3IoXCJjYXB0dXJlZE91dHB1dCBpcyBudWxsXCIpO1xuICBpbml0aWFsT3V0cHV0ID0gY2FwdHVyZWRPdXRwdXQudG9TdHJpbmcoKTtcbiAgY2FwdHVyZWRPdXRwdXQucmVzZXQoKTtcbn07XG5leHBvcnQgY29uc3QgcmVzZXRDYXB0dXJlID0gKCkgPT4ge1xuICBpZiAoIWNhcHR1cmVkT3V0cHV0KSB0aHJvdyBuZXcgRXJyb3IoXCJjYXB0dXJlZE91dHB1dCBpcyBudWxsXCIpO1xuICBjYXB0dXJlZE91dHB1dC5yZXNldCgpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldENhcHR1cmVkT3V0cHV0ID0gKCkgPT4ge1xuICBpZiAoIWNhcHR1cmVkT3V0cHV0KSB0aHJvdyBuZXcgRXJyb3IoXCJjYXB0dXJlZE91dHB1dCBpcyBudWxsXCIpO1xuICByZXR1cm4gY2FwdHVyZWRPdXRwdXQudG9TdHJpbmcoKTtcbn07XG5leHBvcnQgY29uc3QgZ2V0SW5pdGlhbE91dHB1dCA9ICgpID0+IGluaXRpYWxPdXRwdXQ7XG4iLCAiZXhwb3J0IGxldCBfcnVuSWQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbmV4cG9ydCBjb25zdCBzZXRSdW5JZCA9IChydW5JZDogc3RyaW5nKSA9PiB7XG4gIF9ydW5JZCA9IHJ1bklkO1xufTtcblxuZXhwb3J0IGxldCBfY3lwcmVzc1ZlcnNpb246IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbmV4cG9ydCBjb25zdCBzZXRDeXByZXNzVmVyc2lvbiA9IChjeXByZXNzVmVyc2lvbjogc3RyaW5nKSA9PiB7XG4gIF9jeXByZXNzVmVyc2lvbiA9IGN5cHJlc3NWZXJzaW9uO1xufTtcblxuZXhwb3J0IGxldCBfY3VycmVudHNWZXJzaW9uOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG5leHBvcnQgY29uc3Qgc2V0Q3VycmVudHNWZXJzaW9uID0gKHY6IHN0cmluZykgPT4ge1xuICBfY3VycmVudHNWZXJzaW9uID0gdjtcbn07XG4iLCAiaW1wb3J0IHsgcmVxdWlyZSB9IGZyb20gXCIuLi9saWIvcmVxdWlyZVwiO1xuaW1wb3J0IFwiLi9zdGRvdXRcIjtcbmltcG9ydCBcIi4vd3NcIjtcblxuY29uc3QgY3lwcmVzc1BrZyA9IHJlcXVpcmUoXCJjeXByZXNzL3BhY2thZ2UuanNvblwiKTtcbmNvbnN0IHBrZyA9IHJlcXVpcmUoXCJjeXByZXNzLWNsb3VkL3BhY2thZ2UuanNvblwiKTtcblxuaW1wb3J0IHsgaW5pdENhcHR1cmUgfSBmcm9tIFwiLi9jYXB0dXJlXCI7XG5pbXBvcnQgeyBzZXRDdXJyZW50c1ZlcnNpb24sIHNldEN5cHJlc3NWZXJzaW9uIH0gZnJvbSBcIi4vc3RhdGUvZ2xvYmFsXCI7XG5cbmluaXRDYXB0dXJlKCk7XG5zZXRDeXByZXNzVmVyc2lvbihjeXByZXNzUGtnLnZlcnNpb24pO1xuc2V0Q3VycmVudHNWZXJzaW9uKHBrZy52ZXJzaW9uKTtcbiIsICJpbXBvcnQgXCIuL2luaXRcIjtcblxuaW1wb3J0IERlYnVnIGZyb20gXCJkZWJ1Z1wiO1xuaW1wb3J0IHsgZ2V0TGVnYWxOb3RpY2UgfSBmcm9tIFwiLi4vbGVnYWxcIjtcbmltcG9ydCB7IEN1cnJlbnRzUnVuUGFyYW1ldGVycyB9IGZyb20gXCIuLi90eXBlc1wiO1xuaW1wb3J0IHsgY3JlYXRlUnVuIH0gZnJvbSBcIi4vYXBpXCI7XG5pbXBvcnQgeyBjdXRJbml0aWFsT3V0cHV0IH0gZnJvbSBcIi4vY2FwdHVyZVwiO1xuaW1wb3J0IHsgZ2V0Q0kgfSBmcm9tIFwiLi9jaVByb3ZpZGVyXCI7XG5pbXBvcnQge1xuICBnZXRNZXJnZWRDb25maWcsXG4gIGlzT2ZmbGluZSxcbiAgcHJlcHJvY2Vzc1BhcmFtcyxcbiAgdmFsaWRhdGVQYXJhbXMsXG59IGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IHsgcnVuQmFyZUN5cHJlc3MgfSBmcm9tIFwiLi9jeXByZXNzXCI7XG5pbXBvcnQgeyBhY3RpdmF0ZURlYnVnIH0gZnJvbSBcIi4vZGVidWdcIjtcbmltcG9ydCB7IGlzQ3VycmVudHMgfSBmcm9tIFwiLi9lbnZcIjtcbmltcG9ydCB7IGdldEdpdEluZm8gfSBmcm9tIFwiLi9naXRcIjtcbmltcG9ydCB7IHNldEFQSUJhc2VVcmwgfSBmcm9tIFwiLi9odHRwQ2xpZW50XCI7XG5pbXBvcnQgeyBsaXN0ZW5Ub0V2ZW50cyB9IGZyb20gXCIuL2xpc3RlbmVyXCI7XG5pbXBvcnQgeyBib2xkLCBkaW0sIGRpdmlkZXIsIGluZm8sIHNwYWNlciwgdGl0bGUgfSBmcm9tIFwiLi9sb2dcIjtcbmltcG9ydCB7IGdldFBsYXRmb3JtIH0gZnJvbSBcIi4vcGxhdGZvcm1cIjtcbmltcG9ydCB7IHN1bW1hcml6ZUV4ZWN1dGlvbiwgc3VtbWFyeVRhYmxlIH0gZnJvbSBcIi4vcmVzdWx0c1wiO1xuaW1wb3J0IHsgcmVwb3J0VGFza3MsIHJ1blRpbGxEb25lT3JDYW5jZWxsZWQgfSBmcm9tIFwiLi9ydW5uZXJcIjtcbmltcG9ydCB7IHNodXRkb3duIH0gZnJvbSBcIi4vc2h1dGRvd25cIjtcbmltcG9ydCB7IGdldFNwZWNGaWxlcyB9IGZyb20gXCIuL3NwZWNNYXRjaGVyXCI7XG5pbXBvcnQgeyBDb25maWdTdGF0ZSwgRXhlY3V0aW9uU3RhdGUgfSBmcm9tIFwiLi9zdGF0ZVwiO1xuaW1wb3J0IHsgX2N1cnJlbnRzVmVyc2lvbiwgX2N5cHJlc3NWZXJzaW9uLCBzZXRSdW5JZCB9IGZyb20gXCIuL3N0YXRlL2dsb2JhbFwiO1xuaW1wb3J0IHsgcHJpbnRXYXJuaW5ncyB9IGZyb20gXCIuL3dhcm5pbmdzXCI7XG5pbXBvcnQgeyBzdGFydFdTUyB9IGZyb20gXCIuL3dzXCI7XG5cbmNvbnN0IGRlYnVnID0gRGVidWcoXCJjdXJyZW50czpydW5cIik7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW4ocGFyYW1zOiBDdXJyZW50c1J1blBhcmFtZXRlcnMgPSB7fSkge1xuICBjb25zdCBleGVjdXRpb25TdGF0ZSA9IG5ldyBFeGVjdXRpb25TdGF0ZSgpO1xuICBjb25zdCBjb25maWdTdGF0ZSA9IG5ldyBDb25maWdTdGF0ZSgpO1xuXG4gIGFjdGl2YXRlRGVidWcocGFyYW1zLmNsb3VkRGVidWcpO1xuXG4gIGRlYnVnKFwicnVuIHBhcmFtcyAlb1wiLCBwYXJhbXMpO1xuICBwYXJhbXMgPSBwcmVwcm9jZXNzUGFyYW1zKHBhcmFtcyk7XG4gIGRlYnVnKFwicGFyYW1zIGFmdGVyIHByZXByb2Nlc3MgJW9cIiwgcGFyYW1zKTtcblxuICBpZiAoaXNPZmZsaW5lKHBhcmFtcykpIHtcbiAgICBpbmZvKGBTa2lwcGluZyBjbG91ZCBvcmNoZXN0cmF0aW9uIGJlY2F1c2UgLS1yZWNvcmQgaXMgc2V0IHRvIGZhbHNlYCk7XG4gICAgcmV0dXJuIHJ1bkJhcmVDeXByZXNzKHBhcmFtcyk7XG4gIH1cblxuICBjb25zdCB2YWxpZGF0ZWRQYXJhbXMgPSBhd2FpdCB2YWxpZGF0ZVBhcmFtcyhwYXJhbXMpO1xuICBzZXRBUElCYXNlVXJsKHZhbGlkYXRlZFBhcmFtcy5jbG91ZFNlcnZpY2VVcmwpO1xuXG4gIGlmICghaXNDdXJyZW50cygpKSB7XG4gICAgY29uc29sZS5sb2coZ2V0TGVnYWxOb3RpY2UoKSk7XG4gIH1cblxuICBjb25zdCB7XG4gICAgcmVjb3JkS2V5LFxuICAgIHByb2plY3RJZCxcbiAgICBncm91cCxcbiAgICBwYXJhbGxlbCxcbiAgICBjaUJ1aWxkSWQsXG4gICAgdGFnLFxuICAgIHRlc3RpbmdUeXBlLFxuICAgIGJhdGNoU2l6ZSxcbiAgICBhdXRvQ2FuY2VsQWZ0ZXJGYWlsdXJlcyxcbiAgICBleHBlcmltZW50YWxDb3ZlcmFnZVJlY29yZGluZyxcbiAgfSA9IHZhbGlkYXRlZFBhcmFtcztcblxuICBjb25zdCBjb25maWcgPSBhd2FpdCBnZXRNZXJnZWRDb25maWcodmFsaWRhdGVkUGFyYW1zKTtcbiAgY29uZmlnU3RhdGUuc2V0Q29uZmlnKGNvbmZpZz8ucmVzb2x2ZWQpO1xuXG4gIGNvbnN0IHsgc3BlY3MsIHNwZWNQYXR0ZXJuIH0gPSBhd2FpdCBnZXRTcGVjRmlsZXMoe1xuICAgIGNvbmZpZyxcbiAgICBwYXJhbXM6IHZhbGlkYXRlZFBhcmFtcyxcbiAgfSk7XG5cbiAgaWYgKHNwZWNzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHBsYXRmb3JtID0gYXdhaXQgZ2V0UGxhdGZvcm0oe1xuICAgIGNvbmZpZyxcbiAgICBicm93c2VyOiB2YWxpZGF0ZWRQYXJhbXMuYnJvd3NlcixcbiAgfSk7XG5cbiAgaW5mbyhgQ3lwcmVzcy1jbG91ZCB2ZXJzaW9uOiAke2RpbShfY3VycmVudHNWZXJzaW9uKX1gKTtcbiAgaW5mbyhgQ3lwcmVzcyB2ZXJzaW9uOiAke2RpbShfY3lwcmVzc1ZlcnNpb24pfWApO1xuICBpbmZvKFwiRGlzY292ZXJlZCAlZCBzcGVjIGZpbGVzXCIsIHNwZWNzLmxlbmd0aCk7XG4gIGluZm8oXG4gICAgYFRhZ3M6ICR7dGFnLmxlbmd0aCA+IDAgPyB0YWcuam9pbihcIixcIikgOiBmYWxzZX07IEdyb3VwOiAke1xuICAgICAgZ3JvdXAgPz8gZmFsc2VcbiAgICB9OyBQYXJhbGxlbDogJHtwYXJhbGxlbCA/PyBmYWxzZX07IEJhdGNoIFNpemU6ICR7YmF0Y2hTaXplfWBcbiAgKTtcbiAgaW5mbyhcIkNvbm5lY3RpbmcgdG8gY2xvdWQgb3JjaGVzdHJhdGlvbiBzZXJ2aWNlLi4uXCIpO1xuXG4gIGNvbnN0IHJ1biA9IGF3YWl0IGNyZWF0ZVJ1bih7XG4gICAgY2k6IGdldENJKGNpQnVpbGRJZCksXG4gICAgc3BlY3M6IHNwZWNzLm1hcCgoc3BlYykgPT4gc3BlYy5yZWxhdGl2ZSksXG4gICAgY29tbWl0OiBhd2FpdCBnZXRHaXRJbmZvKGNvbmZpZy5wcm9qZWN0Um9vdCksXG4gICAgZ3JvdXAsXG4gICAgcGxhdGZvcm0sXG4gICAgcGFyYWxsZWw6IHBhcmFsbGVsID8/IGZhbHNlLFxuICAgIGNpQnVpbGRJZCxcbiAgICBwcm9qZWN0SWQsXG4gICAgcmVjb3JkS2V5LFxuICAgIHNwZWNQYXR0ZXJuOiBbc3BlY1BhdHRlcm5dLmZsYXQoMiksXG4gICAgdGFnczogdGFnLFxuICAgIHRlc3RpbmdUeXBlLFxuICAgIGJhdGNoU2l6ZSxcbiAgICBhdXRvQ2FuY2VsQWZ0ZXJGYWlsdXJlcyxcbiAgICBjb3ZlcmFnZUVuYWJsZWQ6IGV4cGVyaW1lbnRhbENvdmVyYWdlUmVjb3JkaW5nLFxuICB9KTtcblxuICBzZXRSdW5JZChydW4ucnVuSWQpO1xuICBpbmZvKFwiXHVEODNDXHVERkE1IFJ1biBVUkw6XCIsIGJvbGQocnVuLnJ1blVybCkpO1xuICBjdXRJbml0aWFsT3V0cHV0KCk7XG5cbiAgYXdhaXQgc3RhcnRXU1MoKTtcbiAgbGlzdGVuVG9FdmVudHMoXG4gICAgY29uZmlnU3RhdGUsXG4gICAgZXhlY3V0aW9uU3RhdGUsXG4gICAgY29uZmlnLmV4cGVyaW1lbnRhbENvdmVyYWdlUmVjb3JkaW5nXG4gICk7XG5cbiAgYXdhaXQgcnVuVGlsbERvbmVPckNhbmNlbGxlZChcbiAgICBleGVjdXRpb25TdGF0ZSxcbiAgICBjb25maWdTdGF0ZSxcbiAgICB7XG4gICAgICBydW5JZDogcnVuLnJ1bklkLFxuICAgICAgZ3JvdXBJZDogcnVuLmdyb3VwSWQsXG4gICAgICBtYWNoaW5lSWQ6IHJ1bi5tYWNoaW5lSWQsXG4gICAgICBwbGF0Zm9ybSxcbiAgICAgIHNwZWNzLFxuICAgIH0sXG4gICAgdmFsaWRhdGVkUGFyYW1zXG4gICk7XG5cbiAgZGl2aWRlcigpO1xuXG4gIGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChyZXBvcnRUYXNrcyk7XG4gIGNvbnN0IF9zdW1tYXJ5ID0gc3VtbWFyaXplRXhlY3V0aW9uKFxuICAgIGV4ZWN1dGlvblN0YXRlLmdldFJlc3VsdHMoY29uZmlnU3RhdGUpLFxuICAgIGNvbmZpZ1xuICApO1xuXG4gIHRpdGxlKFwid2hpdGVcIiwgXCJDbG91ZCBSdW4gRmluaXNoZWRcIik7XG4gIGNvbnNvbGUubG9nKHN1bW1hcnlUYWJsZShfc3VtbWFyeSkpO1xuXG4gIHByaW50V2FybmluZ3MoZXhlY3V0aW9uU3RhdGUpO1xuXG4gIGluZm8oXCJcXG5cdUQ4M0NcdURGQzEgUmVjb3JkZWQgUnVuOlwiLCBib2xkKHJ1bi5ydW5VcmwpKTtcblxuICBhd2FpdCBzaHV0ZG93bigpO1xuXG4gIHNwYWNlcigpO1xuXG4gIHJldHVybiB7XG4gICAgLi4uX3N1bW1hcnksXG4gICAgcnVuVXJsOiBydW4ucnVuVXJsLFxuICB9O1xufVxuIiwgImV4cG9ydCBmdW5jdGlvbiBnZXRMZWdhbE5vdGljZSgpIHtcbiAgcmV0dXJuIGBcbkNvcHlyaWdodCAoQykgJHtuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCl9IEN1cnJlbnRzIFNvZnR3YXJlIEluYyBodHRwczovL2N1cnJlbnRzLmRldlxuVGhpcyBpcyBmcmVlIHNvZnR3YXJlLCBhbmQgeW91IGFyZSB3ZWxjb21lIHRvIHJlZGlzdHJpYnV0ZSBpdCB1bmRlciBjZXJ0YWluXG5jb25kaXRpb25zLiBUaGlzIHByb2dyYW0gY29tZXMgd2l0aCBubyB3YXJyYW50eS4gUGFydHMgb2YgdGhpcyBwcm9ncmFtIGFyZSBNSVRcbmxpY2Vuc2VkLiBSZWZlciB0byB0aGUgbGljZW5zZSBmb3IgZGV0YWlsc1xuaHR0cHM6Ly9naXRodWIuY29tL2N1cnJlbnRzLWRldi9jeXByZXNzLWNsb3VkL2Jsb2IvbWFpbi9MSUNFTlNFLm1kXG5gO1xufVxuIiwgImltcG9ydCB7IEF4aW9zRXJyb3IsIGlzQXhpb3NFcnJvciB9IGZyb20gXCJheGlvc1wiO1xuXG5leHBvcnQgY29uc3QgaXNSZXRyaWFibGVFcnJvciA9IChlcnI6IEF4aW9zRXJyb3IpOiBib29sZWFuID0+IHtcbiAgaWYgKGVyci5jb2RlID09PSBcIkVDT05OQUJPUlRFRFwiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGVyci5jb2RlID09PSBcIkVDT05OUkVGVVNFRFwiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGVyci5jb2RlID09PSBcIkVUSU1FRE9VVFwiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoIWlzQXhpb3NFcnJvcihlcnIpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuICEhKFxuICAgIGVycj8ucmVzcG9uc2U/LnN0YXR1cyAmJlxuICAgIDUwMCA8PSBlcnIucmVzcG9uc2Uuc3RhdHVzICYmXG4gICAgZXJyLnJlc3BvbnNlLnN0YXR1cyA8IDYwMFxuICApO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldERlbGF5ID0gKGk6IG51bWJlcikgPT4gWzUgKiAxMDAwLCAxMCAqIDEwMDAsIDMwICogMTAwMF1baSAtIDFdO1xuXG5sZXQgYmFzZVVSTCA9IFwiaHR0cHM6Ly9jeS5jdXJyZW50cy5kZXZcIjtcbmV4cG9ydCBjb25zdCBnZXRBUElCYXNlVXJsID0gKCkgPT4gYmFzZVVSTCA/PyBcImh0dHBzOi8vY3kuY3VycmVudHMuZGV2XCI7XG5leHBvcnQgY29uc3Qgc2V0QVBJQmFzZVVybCA9ICh1cmw/OiBzdHJpbmcpID0+XG4gIChiYXNlVVJMID0gdXJsID8/IFwiaHR0cHM6Ly9jeS5jdXJyZW50cy5kZXZcIik7XG4iLCAiaW1wb3J0IGF4aW9zLCB7XG4gIEF4aW9zRXJyb3IsXG4gIEF4aW9zSW5zdGFuY2UsXG4gIEF4aW9zUmVxdWVzdENvbmZpZyxcbiAgQXhpb3NSZXNwb25zZSxcbiAgUmF3QXhpb3NSZXF1ZXN0SGVhZGVycyxcbn0gZnJvbSBcImF4aW9zXCI7XG5pbXBvcnQgYXhpb3NSZXRyeSBmcm9tIFwiYXhpb3MtcmV0cnlcIjtcbmltcG9ydCBEZWJ1ZyBmcm9tIFwiZGVidWdcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCBwcmV0dHlNaWxsaXNlY29uZHMgZnJvbSBcInByZXR0eS1tc1wiO1xuaW1wb3J0IHsgZ2V0Q3VycmVudHNDb25maWcgfSBmcm9tIFwiLi4vY29uZmlnXCI7XG5pbXBvcnQgeyBWYWxpZGF0aW9uRXJyb3IgfSBmcm9tIFwiLi4vZXJyb3JzXCI7XG5pbXBvcnQgeyB3YXJuIH0gZnJvbSBcIi4uL2xvZ1wiO1xuaW1wb3J0IHsgX2N1cnJlbnRzVmVyc2lvbiwgX2N5cHJlc3NWZXJzaW9uLCBfcnVuSWQgfSBmcm9tIFwiLi4vc3RhdGUvZ2xvYmFsXCI7XG5pbXBvcnQgeyBnZXRBUElCYXNlVXJsLCBnZXREZWxheSwgaXNSZXRyaWFibGVFcnJvciB9IGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IHsgbWF5YmVQcmludEVycm9ycyB9IGZyb20gXCIuL3ByaW50RXJyb3JzXCI7XG5cbmNvbnN0IGRlYnVnID0gRGVidWcoXCJjdXJyZW50czphcGlcIik7XG5cbmNvbnN0IE1BWF9SRVRSSUVTID0gMztcbmNvbnN0IFRJTUVPVVRfTVMgPSAzMCAqIDEwMDA7XG5sZXQgX2NsaWVudDogQXhpb3NJbnN0YW5jZSB8IG51bGwgPSBudWxsO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q2xpZW50KCkge1xuICBpZiAoX2NsaWVudCkge1xuICAgIHJldHVybiBfY2xpZW50O1xuICB9XG4gIGNvbnN0IGN1cnJlbnRzQ29uZmlnID0gYXdhaXQgZ2V0Q3VycmVudHNDb25maWcoKTtcbiAgX2NsaWVudCA9IGF4aW9zLmNyZWF0ZSh7XG4gICAgYmFzZVVSTDogZ2V0QVBJQmFzZVVybCgpLFxuICAgIHRpbWVvdXQ6IFRJTUVPVVRfTVMsXG4gIH0pO1xuXG4gIF9jbGllbnQuaW50ZXJjZXB0b3JzLnJlcXVlc3QudXNlKChjb25maWcpID0+IHtcbiAgICBjb25zdCBjY3lWZXJzb24gPSBfY3VycmVudHNWZXJzaW9uID8/IFwiMC4wLjBcIjtcbiAgICBjb25zdCBoZWFkZXJzOiBSYXdBeGlvc1JlcXVlc3RIZWFkZXJzID0ge1xuICAgICAgLi4uY29uZmlnLmhlYWRlcnMsXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBcIngtY3lwcmVzcy1yZXF1ZXN0LWF0dGVtcHRcIjogY29uZmlnW1wiYXhpb3MtcmV0cnlcIl0/LnJldHJ5Q291bnQgPz8gMCxcbiAgICAgIFwieC1jeXByZXNzLXZlcnNpb25cIjogX2N5cHJlc3NWZXJzaW9uID8/IFwiMC4wLjBcIixcbiAgICAgIFwieC1jY3ktdmVyc2lvblwiOiBjY3lWZXJzb24sXG4gICAgICBcIlVzZXItQWdlbnRcIjogYGN5cHJlc3MtY2xvdWQvJHtjY3lWZXJzb259YCxcbiAgICB9O1xuICAgIGlmIChfcnVuSWQpIHtcbiAgICAgIGhlYWRlcnNbXCJ4LWN5cHJlc3MtcnVuLWlkXCJdID0gX3J1bklkO1xuICAgIH1cbiAgICBpZiAoIWhlYWRlcnNbXCJDb250ZW50LVR5cGVcIl0pIHtcbiAgICAgIGhlYWRlcnNbXCJDb250ZW50LVR5cGVcIl0gPSBcImFwcGxpY2F0aW9uL2pzb25cIjtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudHNDb25maWcubmV0d29ya0hlYWRlcnMpIHtcbiAgICAgIGNvbnN0IGZpbHRlcmVkSGVhZGVycyA9IF8ub21pdChjdXJyZW50c0NvbmZpZy5uZXR3b3JrSGVhZGVycywgW1xuICAgICAgICBcIngtY3lwcmVzcy1yZXF1ZXN0LWF0dGVtcHRcIixcbiAgICAgICAgXCJ4LWN5cHJlc3MtdmVyc2lvblwiLFxuICAgICAgICBcIngtY2N5LXZlcnNpb25cIixcbiAgICAgICAgXCJ4LWN5cHJlc3MtcnVuLWlkXCIsXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCIsXG4gICAgICBdKTtcbiAgICAgIGRlYnVnKFwidXNpbmcgY3VzdG9tIG5ldHdvcmsgaGVhZGVyczogJW9cIiwgZmlsdGVyZWRIZWFkZXJzKTtcbiAgICAgIE9iamVjdC5hc3NpZ24oaGVhZGVycywgZmlsdGVyZWRIZWFkZXJzKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXEgPSB7XG4gICAgICAuLi5jb25maWcsXG4gICAgICBoZWFkZXJzLFxuICAgIH07XG5cbiAgICBkZWJ1ZyhcIm5ldHdvcmsgcmVxdWVzdDogJW9cIiwge1xuICAgICAgLi4uXy5waWNrKHJlcSwgXCJtZXRob2RcIiwgXCJ1cmxcIiwgXCJoZWFkZXJzXCIpLFxuICAgICAgZGF0YTogQnVmZmVyLmlzQnVmZmVyKHJlcS5kYXRhKSA/IFwiYnVmZmVyXCIgOiByZXEuZGF0YSxcbiAgICB9KTtcblxuICAgIHJldHVybiByZXE7XG4gIH0pO1xuXG4gIGF4aW9zUmV0cnkoX2NsaWVudCwge1xuICAgIHJldHJpZXM6IE1BWF9SRVRSSUVTLFxuICAgIHJldHJ5Q29uZGl0aW9uOiBpc1JldHJpYWJsZUVycm9yLFxuICAgIHJldHJ5RGVsYXk6IGdldERlbGF5LFxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBvblJldHJ5LFxuICAgIHNob3VsZFJlc2V0VGltZW91dDogdHJ1ZSxcbiAgfSk7XG4gIHJldHVybiBfY2xpZW50O1xufVxuXG5mdW5jdGlvbiBvblJldHJ5KFxuICByZXRyeUNvdW50OiBudW1iZXIsXG4gIGVycjogQXhpb3NFcnJvcjx7IG1lc3NhZ2U6IHN0cmluZzsgZXJyb3JzPzogc3RyaW5nW10gfT4sXG4gIGNvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnXG4pIHtcbiAgd2FybihcbiAgICBcIk5ldHdvcmsgcmVxdWVzdCAnJXMnIGZhaWxlZDogJyVzJy4gTmV4dCBhdHRlbXB0IGlzIGluICVzICglZC8lZCkuXCIsXG4gICAgYCR7Y29uZmlnLm1ldGhvZH0gJHtjb25maWcudXJsfWAsXG4gICAgZXJyLm1lc3NhZ2UsXG4gICAgcHJldHR5TWlsbGlzZWNvbmRzKGdldERlbGF5KHJldHJ5Q291bnQpKSxcbiAgICByZXRyeUNvdW50LFxuICAgIE1BWF9SRVRSSUVTXG4gICk7XG59XG5cbmV4cG9ydCBjb25zdCBtYWtlUmVxdWVzdCA9IGFzeW5jIDxUID0gYW55LCBEID0gYW55PihcbiAgY29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWc8RD5cbikgPT4ge1xuICByZXR1cm4gKGF3YWl0IGdldENsaWVudCgpKTxELCBBeGlvc1Jlc3BvbnNlPFQ+Pihjb25maWcpXG4gICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgZGVidWcoXCJuZXR3b3JrIHJlc3BvbnNlOiAlb1wiLCBfLm9taXQocmVzLCBcInJlcXVlc3RcIiwgXCJjb25maWdcIikpO1xuICAgICAgcmV0dXJuIHJlcztcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgIG1heWJlUHJpbnRFcnJvcnMoZXJyb3IpO1xuICAgICAgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICB9KTtcbn07XG4iLCAiaW1wb3J0IERlYnVnIGZyb20gXCJkZWJ1Z1wiO1xuXG5pbXBvcnQgeyBQLCBtYXRjaCB9IGZyb20gXCJ0cy1wYXR0ZXJuXCI7XG5pbXBvcnQgeyBEZXRlY3RlZEJyb3dzZXIsIFZhbGlkYXRlZEN1cnJlbnRzUGFyYW1ldGVycyB9IGZyb20gXCIuLi8uLi90eXBlc1wiO1xuaW1wb3J0IHsgYm9vdEN5cHJlc3MgfSBmcm9tIFwiLi4vYm9vdHN0cmFwXCI7XG5pbXBvcnQgeyBkaW0sIGluZm8sIHdhcm4gfSBmcm9tIFwiLi4vbG9nXCI7XG5pbXBvcnQgeyBnZXRDb25maWdGaWxlUGF0aCB9IGZyb20gXCIuL3BhdGhcIjtcblxuY29uc3QgZGVidWcgPSBEZWJ1ZyhcImN1cnJlbnRzOmNvbmZpZ1wiKTtcblxuZXhwb3J0IHR5cGUgRTJFQ29uZmlnID0ge1xuICBiYXRjaFNpemU6IG51bWJlcjtcbn07XG5leHBvcnQgdHlwZSBDb21wb25lbnRDb25maWcgPSB7XG4gIGJhdGNoU2l6ZTogbnVtYmVyO1xufTtcbmV4cG9ydCB0eXBlIEN1cnJlbnRzQ29uZmlnID0ge1xuICBwcm9qZWN0SWQ/OiBzdHJpbmc7XG4gIHJlY29yZEtleT86IHN0cmluZztcbiAgY2xvdWRTZXJ2aWNlVXJsOiBzdHJpbmc7XG4gIGUyZTogRTJFQ29uZmlnO1xuICBjb21wb25lbnQ6IENvbXBvbmVudENvbmZpZztcbiAgbmV0d29ya0hlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufTtcblxubGV0IF9jb25maWc6IEN1cnJlbnRzQ29uZmlnIHwgbnVsbCA9IG51bGw7XG5cbmNvbnN0IGRlZmF1bHRDb25maWc6IEN1cnJlbnRzQ29uZmlnID0ge1xuICBlMmU6IHtcbiAgICBiYXRjaFNpemU6IDMsXG4gIH0sXG4gIGNvbXBvbmVudDoge1xuICAgIGJhdGNoU2l6ZTogNSxcbiAgfSxcbiAgY2xvdWRTZXJ2aWNlVXJsOiBcImh0dHBzOi8vY3kuY3VycmVudHMuZGV2XCIsXG4gIG5ldHdvcmtIZWFkZXJzOiB1bmRlZmluZWQsXG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q3VycmVudHNDb25maWcoXG4gIHByb2plY3RSb290Pzogc3RyaW5nLFxuICBleHBsaWNpdENvbmZpZ0ZpbGVQYXRoPzogc3RyaW5nXG4pOiBQcm9taXNlPEN1cnJlbnRzQ29uZmlnPiB7XG4gIGlmIChfY29uZmlnKSB7XG4gICAgcmV0dXJuIF9jb25maWc7XG4gIH1cblxuICBjb25zdCBjb25maWdGaWxlUGF0aCA9IGdldENvbmZpZ0ZpbGVQYXRoKHByb2plY3RSb290LCBleHBsaWNpdENvbmZpZ0ZpbGVQYXRoKTtcbiAgLy8gdHJ5IGxvYWRpbmcgcG9zc2libGUgY29uZmlnIGZpbGVzXG4gIGZvciAoY29uc3QgZmlsZXBhdGggb2YgY29uZmlnRmlsZVBhdGgpIHtcbiAgICBjb25zdCBjb25maWcgPSBtYXRjaChhd2FpdCBsb2FkQ29uZmlnRmlsZShmaWxlcGF0aCkpXG4gICAgICAud2l0aCh7IGRlZmF1bHQ6IFAubm90KFAubnVsbGlzaCkgfSwgKGMpID0+IGMuZGVmYXVsdClcbiAgICAgIC53aXRoKFAubm90KFAubnVsbGlzaCksIChjKSA9PiBjKVxuICAgICAgLm90aGVyd2lzZSgoKSA9PiBudWxsKTtcblxuICAgIGlmIChjb25maWcpIHtcbiAgICAgIGRlYnVnKFwibG9hZGVkIGN1cnJlbnRzIGNvbmZpZyBmcm9tICclcydcXG4lT1wiLCBmaWxlcGF0aCwgY29uZmlnKTtcbiAgICAgIGluZm8oYFVzaW5nIGNvbmZpZyBmaWxlOiAke2RpbShmaWxlcGF0aCl9YCk7XG4gICAgICBfY29uZmlnID0ge1xuICAgICAgICAuLi5kZWZhdWx0Q29uZmlnLFxuICAgICAgICAuLi5jb25maWcsXG4gICAgICB9O1xuICAgICAgcmV0dXJuIF9jb25maWc7XG4gICAgfVxuICB9XG5cbiAgd2FybihcbiAgICBcIkZhaWxlZCB0byBsb2FkIGNvbmZpZyBmaWxlLCBmYWxsaW5nIGJhY2sgdG8gdGhlIGRlZmF1bHQgY29uZmlnLiBBdHRlbXB0ZWQgbG9jYXRpb25zOiAlc1wiLFxuICAgIGNvbmZpZ0ZpbGVQYXRoXG4gICk7XG4gIF9jb25maWcgPSBkZWZhdWx0Q29uZmlnO1xuICByZXR1cm4gX2NvbmZpZztcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZENvbmZpZ0ZpbGUoZmlsZXBhdGg6IHN0cmluZykge1xuICB0cnkge1xuICAgIGRlYnVnKFwibG9hZGluZyBjdXJyZW50cyBjb25maWcgZmlsZSBmcm9tICclcydcIiwgZmlsZXBhdGgpO1xuICAgIHJldHVybiBhd2FpdCBpbXBvcnQoZmlsZXBhdGgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZGVidWcoXCJmYWlsZWQgbG9hZGluZyBjb25maWcgZmlsZSBmcm9tOiAlc1wiLCBlKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBNZXJnZWRDb25maWcgPSBBd2FpdGVkPFJldHVyblR5cGU8dHlwZW9mIGdldE1lcmdlZENvbmZpZz4+O1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE1lcmdlZENvbmZpZyhwYXJhbXM6IFZhbGlkYXRlZEN1cnJlbnRzUGFyYW1ldGVycykge1xuICBkZWJ1ZyhcInJlc29sdmluZyBjeXByZXNzIGNvbmZpZ1wiKTtcbiAgY29uc3QgY3lwcmVzc1Jlc29sdmVkQ29uZmlnOlxuICAgIHwgKEN5cHJlc3MuUmVzb2x2ZWRDb25maWdPcHRpb25zICYge1xuICAgICAgICBwcm9qZWN0Um9vdDogc3RyaW5nO1xuICAgICAgICByYXdKc29uOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICAgICAgYnJvd3NlcnM6IERldGVjdGVkQnJvd3NlcltdO1xuICAgICAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgICB9KVxuICAgIHwgdW5kZWZpbmVkID0gYXdhaXQgYm9vdEN5cHJlc3MocGFyYW1zKTtcblxuICBkZWJ1ZyhcImN5cHJlc3MgcmVzb2x2ZWRDb25maWc6ICVPXCIsIGN5cHJlc3NSZXNvbHZlZENvbmZpZyk7XG5cbiAgLy8gQHRzLWlnbm9yZVxuICBjb25zdCByYXdFMkVQYXR0ZXJuID0gY3lwcmVzc1Jlc29sdmVkQ29uZmlnLnJhd0pzb24/LmUyZT8uc3BlY1BhdHRlcm47XG4gIGxldCBhZGRpdGlvbmFsSWdub3JlUGF0dGVybjogc3RyaW5nW10gPSBbXTtcbiAgaWYgKHBhcmFtcy50ZXN0aW5nVHlwZSA9PT0gXCJjb21wb25lbnRcIiAmJiByYXdFMkVQYXR0ZXJuKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGFkZGl0aW9uYWxJZ25vcmVQYXR0ZXJuID0gcmF3RTJFUGF0dGVybjtcbiAgfVxuXG4gIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vY3lwcmVzcy1pby9jeXByZXNzL2Jsb2IvZWQwNjY4ZTI0YzJlZTY3NTNiYmQyNWFlNDY3Y2U5NGFlNTg1Nzc0MS9wYWNrYWdlcy9jb25maWcvc3JjL29wdGlvbnMudHMjTDQ1N1xuICAvLyBhbmQgaHR0cHM6Ly9naXRodWIuY29tL2N5cHJlc3MtaW8vY3lwcmVzcy9ibG9iL2RldmVsb3AvcGFja2FnZXMvY29uZmlnL3NyYy9wcm9qZWN0L3V0aWxzLnRzI0w0MTJcbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIHByb2plY3RSb290OiBjeXByZXNzUmVzb2x2ZWRDb25maWc/LnByb2plY3RSb290IHx8IHByb2Nlc3MuY3dkKCksXG4gICAgcHJvamVjdElkOiBwYXJhbXMucHJvamVjdElkLFxuICAgIHNwZWNQYXR0ZXJuOiBjeXByZXNzUmVzb2x2ZWRDb25maWc/LnNwZWNQYXR0ZXJuIHx8IFwiKiovKi4qXCIsXG4gICAgZXhjbHVkZVNwZWNQYXR0ZXJuOlxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY3lwcmVzc1Jlc29sdmVkQ29uZmlnPy5yZXNvbHZlZC5leGNsdWRlU3BlY1BhdHRlcm4udmFsdWUgPz8gW10sXG4gICAgYWRkaXRpb25hbElnbm9yZVBhdHRlcm4sXG4gICAgcmVzb2x2ZWQ6IGN5cHJlc3NSZXNvbHZlZENvbmZpZyxcbiAgICBleHBlcmltZW50YWxDb3ZlcmFnZVJlY29yZGluZzogcGFyYW1zLmV4cGVyaW1lbnRhbENvdmVyYWdlUmVjb3JkaW5nLFxuICB9O1xuICBkZWJ1ZyhcIm1lcmdlZCBjb25maWc6ICVPXCIsIHJlc3VsdCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG4iLCAiaW1wb3J0IHsgZ2V0QmluUGF0aCB9IGZyb20gXCJjeTJcIjtcbmltcG9ydCB7IFZhbGlkYXRlZEN1cnJlbnRzUGFyYW1ldGVycyB9IGZyb20gXCJjeXByZXNzLWNsb3VkL3R5cGVzXCI7XG5pbXBvcnQgRGVidWcgZnJvbSBcImRlYnVnXCI7XG5pbXBvcnQgZXhlY2EsIHsgRXhlY2FFcnJvciB9IGZyb20gXCJleGVjYVwiO1xuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgVmFsaWRhdGlvbkVycm9yIH0gZnJvbSBcIi4uL2Vycm9yc1wiO1xuaW1wb3J0IHsgY3JlYXRlVGVtcEZpbGUgfSBmcm9tIFwiLi4vZnNcIjtcbmltcG9ydCB7IGJvbGQsIGluZm8gfSBmcm9tIFwiLi4vbG9nXCI7XG5pbXBvcnQgeyByZXF1aXJlIH0gZnJvbSBcIi4uL3JlcXVpcmVcIjtcbmltcG9ydCB7IGdldEJvb3RzdHJhcEFyZ3MgfSBmcm9tIFwiLi9zZXJpYWxpemVyXCI7XG5cbmNvbnN0IGRlYnVnID0gRGVidWcoXCJjdXJyZW50czpib290XCIpO1xuXG5leHBvcnQgY29uc3QgYm9vdEN5cHJlc3MgPSBhc3luYyAocGFyYW1zOiBWYWxpZGF0ZWRDdXJyZW50c1BhcmFtZXRlcnMpID0+IHtcbiAgZGVidWcoXCJib290aW5nIGN5cHJlc3MuLi5cIik7XG4gIGNvbnN0IHRlbXBGaWxlUGF0aCA9IGF3YWl0IGNyZWF0ZVRlbXBGaWxlKCk7XG5cbiAgY29uc3QgY3lwcmVzc0JpbiA9IGF3YWl0IGdldEJpblBhdGgocmVxdWlyZS5yZXNvbHZlKFwiY3lwcmVzc1wiKSk7XG4gIGRlYnVnKFwiY3lwcmVzcyBleGVjdXRhYmxlIGxvY2F0aW9uOiAlc1wiLCBjeXByZXNzQmluKTtcblxuICAvLyBpdCBpcyBpbXBvcnRhbnQgdG8gcGFzcyB0aGUgc2FtZSBhcmdzIGluIG9yZGVyIHRvIGdldCB0aGUgc2FtZSBjb25maWcgYXMgZm9yIHRoZSBhY3R1YWwgcnVuXG4gIGNvbnN0IGFyZ3MgPSBnZXRCb290c3RyYXBBcmdzKHsgdGVtcEZpbGVQYXRoLCBwYXJhbXMgfSk7XG4gIGRlYnVnKFwiYm9vdGluZyBjeXByZXNzIHdpdGggYXJnczogJW9cIiwgYXJncyk7XG4gIGNvbnN0IHsgc3Rkb3V0LCBzdGRlcnIgfSA9IGF3YWl0IGV4ZWNDeXByZXNzKGN5cHJlc3NCaW4sIGFyZ3MpO1xuXG4gIGlmICghZnMuZXhpc3RzU3luYyh0ZW1wRmlsZVBhdGgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYENhbm5vdCByZXNvbHZlIGN5cHJlc3MgY29uZmlndXJhdGlvbiBmcm9tICR7dGVtcEZpbGVQYXRofS4gUGxlYXNlIHJlcG9ydCB0aGUgaXNzdWUuYFxuICAgICk7XG4gIH1cbiAgdHJ5IHtcbiAgICBjb25zdCBmID0gZnMucmVhZEZpbGVTeW5jKHRlbXBGaWxlUGF0aCwgXCJ1dGYtOFwiKTtcbiAgICBpZiAoIWYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIklzIGN5cHJlc3MtY2xvdWQvcGx1Z2luIGluc3RhbGxlZD9cIik7XG4gICAgfVxuICAgIGRlYnVnKFwiY3lwcmVzcyBjb25maWcgJyVzJzogJyVzJ1wiLCB0ZW1wRmlsZVBhdGgsIGYpO1xuICAgIHJldHVybiBKU09OLnBhcnNlKGYpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBkZWJ1ZyhcInJlYWQgY29uZmlnIHRlbXAgZmlsZSBmYWlsZWQ6ICVvXCIsIGVycik7XG4gICAgaW5mbyhib2xkKFwiQ3lwcmVzcyBzdGRvdXQ6XFxuXCIpLCBzdGRvdXQpO1xuICAgIGluZm8oYm9sZChcIkN5cHJlc3Mgc3RkZXJyOlxcblwiKSwgc3RkZXJyKTtcblxuICAgIHRocm93IG5ldyBWYWxpZGF0aW9uRXJyb3IoYFVuYWJsZSB0byByZXNvbHZlIGN5cHJlc3MgY29uZmlndXJhdGlvblxuLSBtYWtlIHN1cmUgdGhhdCAnY3lwcmVzcy1jbG91ZC9wbHVnaW4nIGlzIGluc3RhbGxlZFxuLSByZXBvcnQgdGhlIGlzc3VlIHRvZ2V0aGVyIHdpdGggY3lwcmVzcyBzdGRvdXQgYW5kIHN0ZGVyclxuYCk7XG4gIH1cbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGV4ZWNDeXByZXNzKGN5cHJlc3NCaW46IHN0cmluZywgYXJnczogcmVhZG9ubHkgc3RyaW5nW10pIHtcbiAgbGV0IHN0ZG91dCA9IFwiXCI7XG4gIGxldCBzdGRlcnIgPSBcIlwiO1xuICB0cnkge1xuICAgIGF3YWl0IGV4ZWNhKGN5cHJlc3NCaW4sIFtcInJ1blwiLCAuLi5hcmdzXSwge1xuICAgICAgc3RkaW86IFwicGlwZVwiLFxuICAgICAgZW52OiB7XG4gICAgICAgIC4uLnByb2Nlc3MuZW52LFxuICAgICAgICAvLyBwcmV2ZW50IHdhcm5pbmdzIGFib3V0IHJlY29yZGluZyBtb2RlXG4gICAgICAgIENZUFJFU1NfUkVDT1JEX0tFWTogdW5kZWZpbmVkLFxuICAgICAgICBDWVBSRVNTX1BST0pFQ1RfSUQ6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGRlYnVnKFwiZXhlYyBjeXByZXNzIGZhaWxlZCAoY2VydGFpbiBmYWlsdXJlcyBhcmUgZXhwZWN0ZWQpOiAlb1wiLCBlcnIpO1xuICAgIHN0ZG91dCA9IChlcnIgYXMgRXhlY2FFcnJvcikuc3Rkb3V0O1xuICAgIHN0ZGVyciA9IChlcnIgYXMgRXhlY2FFcnJvcikuc3RkZXJyO1xuICB9XG4gIHJldHVybiB7IHN0ZG91dCwgc3RkZXJyIH07XG59XG4iLCAiZXhwb3J0IGNsYXNzIFZhbGlkYXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJcIjtcbiAgfVxufVxuIiwgImltcG9ydCB7IGZpbGUgfSBmcm9tIFwidG1wLXByb21pc2VcIjtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVRlbXBGaWxlID0gYXN5bmMgKCkgPT4ge1xuICBjb25zdCB7IHBhdGggfSA9IGF3YWl0IGZpbGUoKTtcbiAgcmV0dXJuIHBhdGg7XG59O1xuIiwgImltcG9ydCBjaGFsayBmcm9tIFwiY2hhbGtcIjtcbmltcG9ydCB1dGlsIGZyb20gXCJ1dGlsXCI7XG5cbmNvbnN0IGxvZyA9ICguLi5hcmdzOiB1bmtub3duW10pID0+IGNvbnNvbGUubG9nKHV0aWwuZm9ybWF0KC4uLmFyZ3MpKTtcblxuZXhwb3J0IGNvbnN0IGluZm8gPSBsb2c7XG5cbmV4cG9ydCBjb25zdCBmb3JtYXQgPSB1dGlsLmZvcm1hdDtcbmV4cG9ydCBjb25zdCB3aXRoRXJyb3IgPSAobXNnOiBzdHJpbmcpID0+XG4gIGNoYWxrLmJnUmVkLndoaXRlKFwiIEVSUk9SIFwiKSArIFwiIFwiICsgbXNnO1xuZXhwb3J0IGNvbnN0IHdpdGhXYXJuaW5nID0gKG1zZzogc3RyaW5nKSA9PlxuICBjaGFsay5iZ1llbGxvdy5ibGFjayhcIiBXQVJOSU5HIFwiKSArIFwiIFwiICsgbXNnO1xuXG5leHBvcnQgY29uc3Qgd2FybiA9ICguLi5hcmdzOiB1bmtub3duW10pID0+XG4gIGxvZyh3aXRoV2FybmluZyh1dGlsLmZvcm1hdCguLi5hcmdzKSkpO1xuXG5leHBvcnQgY29uc3Qgc3VjY2VzcyA9ICguLi5hcmdzOiB1bmtub3duW10pID0+XG4gIGxvZyhjaGFsay5ncmVlbih1dGlsLmZvcm1hdCguLi5hcmdzKSkpO1xuXG5leHBvcnQgY29uc3QgZXJyb3IgPSAoLi4uYXJnczogdW5rbm93bltdKSA9PlxuICBsb2cod2l0aEVycm9yKHV0aWwuZm9ybWF0KC4uLmFyZ3MpKSArIFwiXFxuXCIpO1xuXG50eXBlIENvbG9yID0gXCJyZWRcIiB8IFwiZ3JlZW5cIiB8IFwieWVsbG93XCIgfCBcImJsdWVcIiB8IFwibWFnZW50YVwiIHwgXCJjeWFuXCIgfCBcIndoaXRlXCI7XG5leHBvcnQgY29uc3QgdGl0bGUgPSAoY29sb3I6IENvbG9yLCAuLi5hcmdzOiB1bmtub3duW10pID0+XG4gIGluZm8oXCJcXG5cIiArIFwiICBcIiArIGNoYWxrW2NvbG9yXS5ib2xkKHV0aWwuZm9ybWF0KC4uLmFyZ3MpKSArIFwiICBcIiArIFwiXFxuXCIpO1xuXG5leHBvcnQgY29uc3QgZGl2aWRlciA9ICgpID0+XG4gIGNvbnNvbGUubG9nKFwiXFxuXCIgKyBjaGFsay5ncmF5KEFycmF5KDEwMCkuZmlsbChcIj1cIikuam9pbihcIlwiKSkgKyBcIlxcblwiKTtcblxuZXhwb3J0IGNvbnN0IHNwYWNlciA9IChuOiBudW1iZXIgPSAwKSA9PlxuICBjb25zb2xlLmxvZyhBcnJheShuKS5maWxsKFwiXCIpLmpvaW4oXCJcXG5cIikpO1xuXG5leHBvcnQgY29uc3QgY3lhbiA9IGNoYWxrLmN5YW47XG5leHBvcnQgY29uc3QgYmx1ZSA9IGNoYWxrLmJsdWVCcmlnaHQ7XG5leHBvcnQgY29uc3QgcmVkID0gY2hhbGsucmVkO1xuZXhwb3J0IGNvbnN0IGdyZWVuID0gY2hhbGsuZ3JlZW5CcmlnaHQ7XG5leHBvcnQgY29uc3QgZ3JheSA9IGNoYWxrLmdyYXk7XG5leHBvcnQgY29uc3Qgd2hpdGUgPSBjaGFsay53aGl0ZTtcbmV4cG9ydCBjb25zdCBtYWdlbnRhID0gY2hhbGsubWFnZW50YTtcbmV4cG9ydCBjb25zdCBib2xkID0gY2hhbGsuYm9sZDtcbmV4cG9ydCBjb25zdCBkaW0gPSBjaGFsay5kaW07XG4iLCAiaW1wb3J0IHtcbiAgQ3VycmVudHNSdW5QYXJhbWV0ZXJzLFxuICBDeXByZXNzUnVuUGFyYW1ldGVycyxcbn0gZnJvbSBcImN5cHJlc3MtY2xvdWQvdHlwZXNcIjtcbmltcG9ydCBEZWJ1ZyBmcm9tIFwiZGVidWdcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IGdldEN5cHJlc3NSdW5BUElQYXJhbXMgfSBmcm9tIFwiLi4vY29uZmlnXCI7XG5pbXBvcnQgeyBzaG91bGRFbmFibGVQbHVnaW5EZWJ1ZyB9IGZyb20gXCIuLi9kZWJ1Z1wiO1xuaW1wb3J0IHsgc29ydE9iamVjdEtleXMgfSBmcm9tIFwiLi4vbGFuZ1wiO1xuaW1wb3J0IHsgZ2V0UmFuZG9tU3RyaW5nIH0gZnJvbSBcIi4uL25hbm9cIjtcbmNvbnN0IGRlYnVnID0gRGVidWcoXCJjdXJyZW50czpib290XCIpO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Qm9vdHN0cmFwQXJncyh7XG4gIHBhcmFtcyxcbiAgdGVtcEZpbGVQYXRoLFxufToge1xuICBwYXJhbXM6IEN1cnJlbnRzUnVuUGFyYW1ldGVycztcbiAgdGVtcEZpbGVQYXRoOiBzdHJpbmc7XG59KSB7XG4gIHJldHVybiBfLmNoYWluKGdldEN5cHJlc3NDTElQYXJhbXMocGFyYW1zKSlcbiAgICAudGhydSgob3B0cykgPT4gKHtcbiAgICAgIC4uLm9wdHMsXG4gICAgICAvLyBtZXJnZSB0aGUgZW52IHdpdGggdGhlIGN1cnJlbnRzIHNwZWNpZmljIGVudiB2YXJpYWJsZXNcbiAgICAgIGVudjoge1xuICAgICAgICAuLi4ob3B0cy5lbnYgPz8ge30pLFxuICAgICAgICBjdXJyZW50c19tYXJrZXI6IHRydWUsXG4gICAgICAgIGN1cnJlbnRzX3RlbXBfZmlsZTogdGVtcEZpbGVQYXRoLFxuICAgICAgICBjdXJyZW50c19kZWJ1Z19lbmFibGVkOiBzaG91bGRFbmFibGVQbHVnaW5EZWJ1ZyhwYXJhbXMuY2xvdWREZWJ1ZyksXG4gICAgICB9LFxuICAgIH0pKVxuICAgIC50YXAoKG9wdHMpID0+IHtcbiAgICAgIGRlYnVnKFwiY3lwcmVzcyBib290c3RyYXAgcGFyYW1zOiAlb1wiLCBvcHRzKTtcbiAgICB9KVxuICAgIC50aHJ1KChvcHRzKSA9PiAoe1xuICAgICAgLi4ub3B0cyxcbiAgICAgIGVudjogc29ydE9iamVjdEtleXMob3B0cy5lbnYgPz8ge30pLFxuICAgIH0pKVxuICAgIC50aHJ1KHNlcmlhbGl6ZU9wdGlvbnMpXG4gICAgLnRhcCgob3B0cykgPT4ge1xuICAgICAgZGVidWcoXCJjeXByZXNzIGJvb3RzdHJhcCBzZXJpYWxpemVkIHBhcmFtczogJW9cIiwgb3B0cyk7XG4gICAgfSlcbiAgICAudGhydSgoYXJncykgPT4ge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgLi4uYXJncyxcbiAgICAgICAgXCItLXNwZWNcIixcbiAgICAgICAgZ2V0UmFuZG9tU3RyaW5nKCksXG4gICAgICAgIHBhcmFtcy50ZXN0aW5nVHlwZSA9PT0gXCJjb21wb25lbnRcIiA/IFwiLS1jb21wb25lbnRcIiA6IFwiLS1lMmVcIixcbiAgICAgIF07XG4gICAgfSlcbiAgICAudmFsdWUoKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBDdXJyZW50cyBvcHRpb25zIHRvIEN5cHJlc3MgQ0xJIHBhcmFtcy5cbiAqIEN5cHJlc3MgQ0xJIG9wdGlvbnMgYXJlIGRpZmZlcmVudCBmcm9tIEN5cHJlc3MgbW9kdWxlIEFQSSBvcHRpb25zLlxuICpcbiAqIEBwYXJhbSBwYXJhbXMgQ3VycmVudHMgcGFyYW1cbiAqIEByZXR1cm5zIEN5cHJlc3MgQ0xJIHBhcmFtc1xuICogQHNlZSBodHRwczovL2RvY3MuY3lwcmVzcy5pby9ndWlkZXMvZ3VpZGVzL2NvbW1hbmQtbGluZSNjeXByZXNzLXJ1blxuICogQHNlZSBodHRwczovL2RvY3MuY3lwcmVzcy5pby9hcGkvbW9kdWxlLWFwaVxuICovXG5mdW5jdGlvbiBnZXRDeXByZXNzQ0xJUGFyYW1zKFxuICBwYXJhbXM6IEN1cnJlbnRzUnVuUGFyYW1ldGVyc1xuKTogQ3lwcmVzc1J1blBhcmFtZXRlcnMge1xuICBjb25zdCByZXN1bHQgPSBnZXRDeXByZXNzUnVuQVBJUGFyYW1zKHBhcmFtcyk7XG4gIGNvbnN0IHRlc3RpbmdUeXBlID1cbiAgICByZXN1bHQudGVzdGluZ1R5cGUgPT09IFwiY29tcG9uZW50XCJcbiAgICAgID8ge1xuICAgICAgICAgIGNvbXBvbmVudDogdHJ1ZSxcbiAgICAgICAgfVxuICAgICAgOiB7fTtcbiAgcmV0dXJuIHtcbiAgICAuLi5fLm9taXQocmVzdWx0LCBcInRlc3RpbmdUeXBlXCIpLFxuICAgIC4uLnRlc3RpbmdUeXBlLFxuICB9O1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVPcHRpb25zKG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogc3RyaW5nW10ge1xuICByZXR1cm4gT2JqZWN0LmVudHJpZXMob3B0aW9ucykuZmxhdE1hcCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgY29uc3QgX2tleSA9IGRhc2hlZChrZXkpO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IHRydWUgPyBbYC0tJHtfa2V5fWBdIDogW2AtLSR7X2tleX1gLCBmYWxzZV07XG4gICAgfVxuXG4gICAgaWYgKF8uaXNPYmplY3QodmFsdWUpKSB7XG4gICAgICByZXR1cm4gW2AtLSR7X2tleX1gLCBzZXJpYWxpemVDb21wbGV4UGFyYW0odmFsdWUpXTtcbiAgICB9XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgcmV0dXJuIFtgLS0ke19rZXl9YCwgdmFsdWUudG9TdHJpbmcoKV07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXJpYWxpemVDb21wbGV4UGFyYW0ocGFyYW06IHt9KSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShwYXJhbSk7XG59XG5cbmNvbnN0IGRhc2hlZCA9ICh2OiBzdHJpbmcpID0+IHYucmVwbGFjZSgvW0EtWl0vZywgKG0pID0+IFwiLVwiICsgbS50b0xvd2VyQ2FzZSgpKTtcbiIsICJpbXBvcnQgZGVidWcgZnJvbSBcImRlYnVnXCI7XG5pbXBvcnQgeyBtYXRjaCwgUCB9IGZyb20gXCJ0cy1wYXR0ZXJuXCI7XG5pbXBvcnQgeyBDdXJyZW50c1J1blBhcmFtZXRlcnMsIERlYnVnTW9kZSB9IGZyb20gXCIuLi8uLi90eXBlc1wiO1xuXG5lbnVtIERlYnVnVG9rZW5zIHtcbiAgQ3VycmVudHMgPSBcImN1cnJlbnRzOipcIixcbiAgQ3lwcmVzcyA9IFwiY3lwcmVzczoqXCIsXG4gIENvbW1pdEluZm8gPSBcImNvbW1pdC1pbmZvXCIsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRFbmFibGVQbHVnaW5EZWJ1ZyhcbiAgcGFyYW06IEN1cnJlbnRzUnVuUGFyYW1ldGVyc1tcImNsb3VkRGVidWdcIl1cbikge1xuICByZXR1cm4gbWF0Y2gocGFyYW0pXG4gICAgLndpdGgoUC5udWxsaXNoLCAoKSA9PiBmYWxzZSlcbiAgICAud2l0aChEZWJ1Z01vZGUuTm9uZSwgKCkgPT4gZmFsc2UpXG4gICAgLndpdGgodHJ1ZSwgKCkgPT4gdHJ1ZSlcbiAgICAud2l0aChEZWJ1Z01vZGUuQWxsLCAoKSA9PiB0cnVlKVxuICAgIC53aXRoKERlYnVnTW9kZS5DdXJyZW50cywgKCkgPT4gdHJ1ZSlcbiAgICAud2l0aChcbiAgICAgIFAuYXJyYXkoUC5zdHJpbmcpLFxuICAgICAgKHYpID0+IHYuaW5jbHVkZXMoRGVidWdNb2RlLkFsbCkgfHwgdi5pbmNsdWRlcyhEZWJ1Z01vZGUuQ3VycmVudHMpXG4gICAgKVxuICAgIC5vdGhlcndpc2UoKCkgPT4gZmFsc2UpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlRGVidWcobW9kZTogQ3VycmVudHNSdW5QYXJhbWV0ZXJzW1wiY2xvdWREZWJ1Z1wiXSkge1xuICBtYXRjaChtb2RlKVxuICAgIC53aXRoKFAuaW5zdGFuY2VPZihBcnJheSksIChpKSA9PiBpLmZvckVhY2goc2V0RGVidWdNb2RlKSlcbiAgICAud2l0aCh0cnVlLCAoKSA9PiBzZXREZWJ1Z01vZGUoRGVidWdNb2RlLkFsbCkpXG4gICAgLndpdGgoXG4gICAgICBQLnVuaW9uKFxuICAgICAgICBEZWJ1Z01vZGUuQWxsLFxuICAgICAgICBEZWJ1Z01vZGUuQ3VycmVudHMsXG4gICAgICAgIERlYnVnTW9kZS5DeXByZXNzLFxuICAgICAgICBEZWJ1Z01vZGUuQ29tbWl0SW5mb1xuICAgICAgKSxcbiAgICAgIChpKSA9PiBzZXREZWJ1Z01vZGUoaSlcbiAgICApXG4gICAgLm90aGVyd2lzZSgoKSA9PiBzZXREZWJ1Z01vZGUoRGVidWdNb2RlLk5vbmUpKTtcbn1cblxuZnVuY3Rpb24gc2V0RGVidWdNb2RlKG1vZGU6IHN0cmluZykge1xuICBpZiAobW9kZSA9PT0gRGVidWdNb2RlLk5vbmUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB0b2tlbnMgPSBuZXcgU2V0KHByb2Nlc3MuZW52LkRFQlVHID8gcHJvY2Vzcy5lbnYuREVCVUcuc3BsaXQoXCIsXCIpIDogW10pO1xuICBtYXRjaChtb2RlKVxuICAgIC53aXRoKERlYnVnTW9kZS5BbGwsICgpID0+IHtcbiAgICAgIHRva2Vucy5hZGQoRGVidWdUb2tlbnMuQ29tbWl0SW5mbyk7XG4gICAgICB0b2tlbnMuYWRkKERlYnVnVG9rZW5zLkN1cnJlbnRzKTtcbiAgICAgIHRva2Vucy5hZGQoRGVidWdUb2tlbnMuQ3lwcmVzcyk7XG4gICAgfSlcbiAgICAud2l0aChEZWJ1Z01vZGUuQ3VycmVudHMsICgpID0+IHRva2Vucy5hZGQoRGVidWdUb2tlbnMuQ3VycmVudHMpKVxuICAgIC53aXRoKERlYnVnTW9kZS5DeXByZXNzLCAoKSA9PiB0b2tlbnMuYWRkKERlYnVnVG9rZW5zLkN5cHJlc3MpKVxuICAgIC53aXRoKERlYnVnTW9kZS5Db21taXRJbmZvLCAoKSA9PiB0b2tlbnMuYWRkKERlYnVnVG9rZW5zLkNvbW1pdEluZm8pKVxuICAgIC5vdGhlcndpc2UoKCkgPT4ge30pO1xuXG4gIGRlYnVnLmVuYWJsZShBcnJheS5mcm9tKHRva2Vucykuam9pbihcIixcIikpO1xufVxuIiwgImltcG9ydCBibHVlYmlyZCBmcm9tIFwiYmx1ZWJpcmRcIjtcblxuYmx1ZWJpcmQuUHJvbWlzZS5jb25maWcoe1xuICBjYW5jZWxsYXRpb246IHRydWUsXG59KTtcbmV4cG9ydCBjb25zdCBCUHJvbWlzZSA9IGJsdWViaXJkLlByb21pc2U7XG5cbmV4cG9ydCBjb25zdCBzYWZlID1cbiAgPFQgZXh0ZW5kcyBhbnlbXSwgUiBleHRlbmRzIGFueSwgRiBleHRlbmRzIGFueT4oXG4gICAgZm46ICguLi5hcmdzOiBUKSA9PiBQcm9taXNlPFI+LFxuICAgIGlmRmFsZWQ6IChlOiB1bmtub3duKSA9PiBGLFxuICAgIGlmU3VjY2VlZDogKCkgPT4gYW55XG4gICkgPT5cbiAgYXN5bmMgKC4uLmFyZ3M6IFQpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgciA9IGF3YWl0IGZuKC4uLmFyZ3MpO1xuICAgICAgaWZTdWNjZWVkKCk7XG4gICAgICByZXR1cm4gcjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gaWZGYWxlZChlKTtcbiAgICB9XG4gIH07XG5cbmV4cG9ydCBjb25zdCBzb3J0T2JqZWN0S2V5cyA9IDxUIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgYW55Pj4ob2JqOiBUKSA9PiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopXG4gICAgLnNvcnQoKVxuICAgIC5yZWR1Y2UoKGFjYywga2V5KSA9PiB7XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBhY2Nba2V5XSA9IG9ialtrZXldO1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LCB7fSBhcyBUKTtcbn07XG4iLCAiaW1wb3J0IHsgY3VzdG9tQWxwaGFiZXQgfSBmcm9tIFwibmFub2lkXCI7XG5cbmV4cG9ydCBjb25zdCBnZXRSYW5kb21TdHJpbmcgPSBjdXN0b21BbHBoYWJldChcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCIsIDEwKTtcbiIsICJpbXBvcnQgaXNBYnNvbHV0ZSBmcm9tIFwiaXMtYWJzb2x1dGVcIjtcbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0RmlsZW5hbWVzID0gW1xuICBcImN1cnJlbnRzLmNvbmZpZy5qc1wiLFxuICBcImN1cnJlbnRzLmNvbmZpZy5janNcIixcbiAgXCJjdXJyZW50cy5jb25maWcubWpzXCIsXG5dO1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbmZpZ0ZpbGVQYXRoKFxuICBwcm9qZWN0Um9vdDogc3RyaW5nIHwgbnVsbCA9IG51bGwsXG4gIGV4cGxpY2l0Q29uZmlnRmlsZVBhdGg/OiBzdHJpbmdcbik6IHN0cmluZ1tdIHtcbiAgY29uc3QgcHJlZml4ID0gcHJvamVjdFJvb3QgPz8gcHJvY2Vzcy5jd2QoKTtcbiAgaWYgKFxuICAgIF8uaXNTdHJpbmcoZXhwbGljaXRDb25maWdGaWxlUGF0aCkgJiZcbiAgICBpc0Fic29sdXRlKGV4cGxpY2l0Q29uZmlnRmlsZVBhdGgpXG4gICkge1xuICAgIHJldHVybiBbZXhwbGljaXRDb25maWdGaWxlUGF0aF07XG4gIH1cbiAgaWYgKF8uaXNTdHJpbmcoZXhwbGljaXRDb25maWdGaWxlUGF0aCkpIHtcbiAgICByZXR1cm4gW25vcm1hbGl6ZVBhdGgocHJlZml4LCBleHBsaWNpdENvbmZpZ0ZpbGVQYXRoKV07XG4gIH1cblxuICByZXR1cm4gZGVmYXVsdEZpbGVuYW1lcy5tYXAoKHApID0+IG5vcm1hbGl6ZVBhdGgocHJlZml4LCBwKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVQYXRoKHByZWZpeDogc3RyaW5nLCBmaWxlbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBmaWxlOi8vJHtwYXRoLnJlc29sdmUocHJlZml4LCBmaWxlbmFtZSl9YDtcbn1cbiIsICJpbXBvcnQge1xuICBDdXJyZW50c1J1blBhcmFtZXRlcnMsXG4gIEN5cHJlc3NSdW5QYXJhbWV0ZXJzLFxuICBWYWxpZGF0ZWRDdXJyZW50c1BhcmFtZXRlcnMsXG59IGZyb20gXCJjeXByZXNzLWNsb3VkL3R5cGVzXCI7XG5pbXBvcnQgRGVidWcgZnJvbSBcImRlYnVnXCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBzaG91bGRFbmFibGVQbHVnaW5EZWJ1ZyB9IGZyb20gXCIuLi9kZWJ1Z1wiO1xuaW1wb3J0IHsgVmFsaWRhdGlvbkVycm9yIH0gZnJvbSBcIi4uL2Vycm9yc1wiO1xuaW1wb3J0IHsgZXJyb3IgfSBmcm9tIFwiLi4vbG9nXCI7XG5pbXBvcnQgeyBnZXRDdXJyZW50c0NvbmZpZyB9IGZyb20gXCIuL2NvbmZpZ1wiO1xuY29uc3QgZGVidWcgPSBEZWJ1ZyhcImN1cnJlbnRzOnZhbGlkYXRlUGFyYW1zXCIpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZUN1cnJlbnRzUGFyYW1zKFxuICBwYXJhbXM6IEN1cnJlbnRzUnVuUGFyYW1ldGVyc1xuKTogUHJvbWlzZTxDdXJyZW50c1J1blBhcmFtZXRlcnM+IHtcbiAgY29uc3QgY29uZmlnRnJvbUZpbGUgPSBhd2FpdCBnZXRDdXJyZW50c0NvbmZpZyhcbiAgICBwYXJhbXMucHJvamVjdCxcbiAgICBwYXJhbXMuY2xvdWRDb25maWdGaWxlXG4gICk7XG5cbiAgZGVidWcoXCJyZXNvbHZpbmcgY3VycmVudHMgcGFyYW1zOiAlb1wiLCBwYXJhbXMpO1xuICBkZWJ1ZyhcInJlc29sdmluZyBjdXJyZW50cyBjb25maWcgZmlsZTogJW9cIiwgY29uZmlnRnJvbUZpbGUpO1xuICBjb25zdCBjbG91ZFNlcnZpY2VVcmwgPVxuICAgIHBhcmFtcy5jbG91ZFNlcnZpY2VVcmwgPz9cbiAgICBwcm9jZXNzLmVudi5DVVJSRU5UU19BUElfVVJMID8/XG4gICAgY29uZmlnRnJvbUZpbGUuY2xvdWRTZXJ2aWNlVXJsO1xuXG4gIGNvbnN0IHJlY29yZEtleSA9XG4gICAgcGFyYW1zLnJlY29yZEtleSA/P1xuICAgIHByb2Nlc3MuZW52LkNVUlJFTlRTX1JFQ09SRF9LRVkgPz9cbiAgICBjb25maWdGcm9tRmlsZS5yZWNvcmRLZXk7XG5cbiAgY29uc3QgcHJvamVjdElkID1cbiAgICBwYXJhbXMucHJvamVjdElkID8/XG4gICAgcHJvY2Vzcy5lbnYuQ1VSUkVOVFNfUFJPSkVDVF9JRCA/P1xuICAgIGNvbmZpZ0Zyb21GaWxlLnByb2plY3RJZDtcblxuICBjb25zdCB0ZXN0aW5nVHlwZSA9IHBhcmFtcy50ZXN0aW5nVHlwZSA/PyBcImUyZVwiO1xuXG4gIGxldCBiYXRjaFNpemUgPSBwYXJhbXMuYmF0Y2hTaXplO1xuICBpZiAoIWJhdGNoU2l6ZSkge1xuICAgIGJhdGNoU2l6ZSA9XG4gICAgICB0ZXN0aW5nVHlwZSA9PT0gXCJlMmVcIlxuICAgICAgICA/IGNvbmZpZ0Zyb21GaWxlLmUyZS5iYXRjaFNpemVcbiAgICAgICAgOiBjb25maWdGcm9tRmlsZS5jb21wb25lbnQuYmF0Y2hTaXplO1xuICB9XG5cbiAgLy8gYmF0Y2hTaXplIGFuZCBjbG91ZFNlcnZpY2VVcmwgZGVmYXVsdHMgYXJlIGluIGdldEN1cnJlbnRzQ29uZmlnKClcbiAgcmV0dXJuIHtcbiAgICAuLi5wYXJhbXMsXG4gICAgY2xvdWRTZXJ2aWNlVXJsLFxuICAgIHJlY29yZEtleSxcbiAgICBwcm9qZWN0SWQsXG4gICAgYmF0Y2hTaXplLFxuICAgIHRlc3RpbmdUeXBlLFxuICB9O1xufVxuXG5leHBvcnQgY29uc3QgcHJvamVjdElkRXJyb3IgPSBgQ2Fubm90IHJlc29sdmUgcHJvamVjdElkLiBQbGVhc2UgdXNlIG9uZSBvZiB0aGUgZm9sbG93aW5nOlxuLSBwcm92aWRlIGl0IGFzIGEgXCJwcm9qZWN0SWRcIiBwcm9wZXJ0eSBmb3IgXCJydW5cIiBBUEkgbWV0aG9kXG4tIHNldCBDVVJSRU5UU19QUk9KRUNUX0lEIGVudmlyb25tZW50IHZhcmlhYmxlXG4tIHNldCBcInByb2plY3RJZFwiIGluIFwiY3VycmVudHMuY29uZmlnLntjfWpzXCIgZmlsZWA7XG5cbmV4cG9ydCBjb25zdCBjbG91ZFNlcnZpY2VVcmxFcnJvciA9IGBDYW5ub3QgcmVzb2x2ZSBjbG91ZCBzZXJ2aWNlIFVSTC4gUGxlYXNlIHVzZSBvbmUgb2YgdGhlIGZvbGxvd2luZzpcbi0gcHJvdmlkZSBpdCBhcyBhIFwiY2xvdWRTZXJ2aWNlVXJsXCIgcHJvcGVydHkgZm9yIFwicnVuXCIgQVBJIG1ldGhvZFxuLSBzZXQgQ1VSUkVOVFNfQVBJX1VSTCBlbnZpcm9ubWVudCB2YXJpYWJsZVxuLSBzZXQgXCJjbG91ZFNlcnZpY2VVcmxcIiBpbiBcImN1cnJlbnRzLmNvbmZpZy57Y31qc1wiIGZpbGVgO1xuXG5leHBvcnQgY29uc3QgY2xvdWRTZXJ2aWNlSW52YWxpZFVybEVycm9yID0gYEludmFsaWQgY2xvdWQgc2VydmljZSBVUkwgcHJvdmlkZWRgO1xuXG5leHBvcnQgY29uc3QgcmVjb3JkS2V5RXJyb3IgPSBgQ2Fubm90IHJlc29sdmUgcmVjb3JkIGtleS4gUGxlYXNlIHVzZSBvbmUgb2YgdGhlIGZvbGxvd2luZzpcblxuLSBwYXNzIGl0IGFzIGEgQ0xJIGZsYWcgJy1rLCAtLWtleSA8cmVjb3JkLWtleT4nXG4tIHByb3ZpZGUgaXQgYXMgYSBcInJlY29yZEtleVwiIHByb3BlcnR5IGZvciBcInJ1blwiIEFQSSBtZXRob2Rcbi0gc2V0IENVUlJFTlRTX1JFQ09SRF9LRVkgZW52aXJvbm1lbnQgdmFyaWFibGVcbi0gc2V0IFwicmVjb3JkS2V5XCIgaW4gXCJjdXJyZW50cy5jb25maWcue2N9anNcIiBmaWxlXG5gO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmFsaWRhdGVQYXJhbXMoXG4gIF9wYXJhbXM6IEN1cnJlbnRzUnVuUGFyYW1ldGVyc1xuKTogUHJvbWlzZTxWYWxpZGF0ZWRDdXJyZW50c1BhcmFtZXRlcnM+IHtcbiAgY29uc3QgcGFyYW1zID0gYXdhaXQgcmVzb2x2ZUN1cnJlbnRzUGFyYW1zKF9wYXJhbXMpO1xuXG4gIGRlYnVnKFwidmFsaWRhdGluZyBjdXJyZW50cyBwYXJhbXM6ICVvXCIsIHBhcmFtcyk7XG4gIGlmICghcGFyYW1zLmNsb3VkU2VydmljZVVybCkge1xuICAgIHRocm93IG5ldyBWYWxpZGF0aW9uRXJyb3IoY2xvdWRTZXJ2aWNlVXJsRXJyb3IpO1xuICB9XG4gIGlmICghcGFyYW1zLnByb2plY3RJZCkge1xuICAgIHRocm93IG5ldyBWYWxpZGF0aW9uRXJyb3IocHJvamVjdElkRXJyb3IpO1xuICB9XG4gIGlmICghcGFyYW1zLnJlY29yZEtleSkge1xuICAgIHRocm93IG5ldyBWYWxpZGF0aW9uRXJyb3IocmVjb3JkS2V5RXJyb3IpO1xuICB9XG5cbiAgdmFsaWRhdGVVUkwocGFyYW1zLmNsb3VkU2VydmljZVVybCk7XG5cbiAgY29uc3QgcmVxdWlyZWRQYXJhbWV0ZXJzOiBBcnJheTxrZXlvZiBDdXJyZW50c1J1blBhcmFtZXRlcnM+ID0gW1xuICAgIFwidGVzdGluZ1R5cGVcIixcbiAgICBcImJhdGNoU2l6ZVwiLFxuICAgIFwicHJvamVjdElkXCIsXG4gIF07XG4gIHJlcXVpcmVkUGFyYW1ldGVycy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAodHlwZW9mIHBhcmFtc1trZXldID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBlcnJvcignTWlzc2luZyByZXF1aXJlZCBwYXJhbWV0ZXIgXCIlc1wiJywga2V5KTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk1pc3NpbmcgcmVxdWlyZWQgcGFyYW1ldGVyXCIpO1xuICAgIH1cbiAgfSk7XG5cbiAgcGFyYW1zLnRhZyA9IHBhcnNlVGFncyhwYXJhbXMudGFnKTtcbiAgcGFyYW1zLmF1dG9DYW5jZWxBZnRlckZhaWx1cmVzID0gZ2V0QXV0b0NhbmNlbFZhbHVlKFxuICAgIHBhcmFtcy5hdXRvQ2FuY2VsQWZ0ZXJGYWlsdXJlc1xuICApO1xuXG4gIGRlYnVnKFwidmFsaWRhdGVkIGN1cnJlbnRzIHBhcmFtczogJW9cIiwgcGFyYW1zKTtcblxuICAvLyBUT0RPOiByZW1vdmUgdGhpcyBjYXN0IGFmdGVyIGZpbmRpbmcgYSB3YXkgdG8gcHJvcGVybHkgcmVzb2x2ZSBwYXJhbXMgdHlwZSBhZnRlciB2YWxpZGF0aW9uc1xuICByZXR1cm4gcGFyYW1zIGFzIFZhbGlkYXRlZEN1cnJlbnRzUGFyYW1ldGVycztcbn1cblxuZnVuY3Rpb24gZ2V0QXV0b0NhbmNlbFZhbHVlKHZhbHVlOiB1bmtub3duKTogbnVtYmVyIHwgZmFsc2UgfCB1bmRlZmluZWQge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIikge1xuICAgIHJldHVybiB2YWx1ZSA/IDEgOiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIgJiYgdmFsdWUgPiAwKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcihcbiAgICBgYXV0b0NhbmNlbEFmdGVyRmFpbHVyZXM6IHNob3VsZCBiZSBhIHBvc2l0aXZlIGludGVnZXIgb3IgXCJmYWxzZVwiLiBHb3Q6IFwiJHt2YWx1ZX1cImBcbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzT2ZmbGluZShwYXJhbXM6IEN1cnJlbnRzUnVuUGFyYW1ldGVycykge1xuICByZXR1cm4gcGFyYW1zLnJlY29yZCA9PT0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHBhcnNlVGFncyh0YWdTdHJpbmc6IEN1cnJlbnRzUnVuUGFyYW1ldGVyc1tcInRhZ1wiXSk6IHN0cmluZ1tdIHtcbiAgaWYgKCF0YWdTdHJpbmcpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkodGFnU3RyaW5nKSkge1xuICAgIHJldHVybiB0YWdTdHJpbmcuZmlsdGVyKEJvb2xlYW4pO1xuICB9XG4gIHJldHVybiB0YWdTdHJpbmdcbiAgICAuc3BsaXQoXCIsXCIpXG4gICAgLm1hcCgodGFnKSA9PiB0YWcudHJpbSgpKVxuICAgIC5maWx0ZXIoQm9vbGVhbik7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlVVJMKHVybDogc3RyaW5nKTogdm9pZCB7XG4gIHRyeSB7XG4gICAgbmV3IFVSTCh1cmwpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICB0aHJvdyBuZXcgVmFsaWRhdGlvbkVycm9yKGAke2Nsb3VkU2VydmljZUludmFsaWRVcmxFcnJvcn06IFwiJHt1cmx9XCJgKTtcbiAgfVxufVxuXG4vKipcbiAqXG4gKiBAcmV0dXJucyBDeXByZXNzIG9wdGlvbnMgd2l0aG91dCBpdGVtcyB0aGF0IGFmZmVjdCByZWNvcmRpbmcgbW9kZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3lwcmVzc1J1bkFQSVBhcmFtcyhcbiAgcGFyYW1zOiBDdXJyZW50c1J1blBhcmFtZXRlcnNcbik6IEN5cHJlc3NSdW5QYXJhbWV0ZXJzIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5fLnBpY2tCeShcbiAgICAgIF8ub21pdChwYXJhbXMsIFtcbiAgICAgICAgXCJjbG91ZERlYnVnXCIsXG4gICAgICAgIFwiY2xvdWRDb25maWdGaWxlXCIsXG4gICAgICAgIFwiYXV0b0NhbmNlbEFmdGVyRmFpbHVyZXNcIixcbiAgICAgICAgXCJjbG91ZFNlcnZpY2VVcmxcIixcbiAgICAgICAgXCJiYXRjaFNpemVcIixcbiAgICAgICAgXCJwcm9qZWN0SWRcIixcbiAgICAgICAgXCJrZXlcIixcbiAgICAgICAgXCJyZWNvcmRLZXlcIixcbiAgICAgICAgXCJyZWNvcmRcIixcbiAgICAgICAgXCJncm91cFwiLFxuICAgICAgICBcInBhcmFsbGVsXCIsXG4gICAgICAgIFwidGFnXCIsXG4gICAgICAgIFwiY2lCdWlsZElkXCIsXG4gICAgICAgIFwic3BlY1wiLFxuICAgICAgICBcImV4aXRcIixcbiAgICAgICAgXCJoZWFkbGVzc1wiLFxuICAgICAgICBcImV4cGVyaW1lbnRhbENvdmVyYWdlUmVjb3JkaW5nXCIsXG4gICAgICBdKSxcbiAgICAgIEJvb2xlYW5cbiAgICApLFxuICAgIHJlY29yZDogZmFsc2UsXG4gICAgZW52OiB7XG4gICAgICAuLi5wYXJhbXMuZW52LFxuICAgICAgY3VycmVudHNfZGVidWdfZW5hYmxlZDogc2hvdWxkRW5hYmxlUGx1Z2luRGVidWcocGFyYW1zLmNsb3VkRGVidWcpLFxuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmVwcm9jZXNzUGFyYW1zKFxuICBwYXJhbXM6IEN1cnJlbnRzUnVuUGFyYW1ldGVyc1xuKTogQ3VycmVudHNSdW5QYXJhbWV0ZXJzIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5wYXJhbXMsXG4gICAgc3BlYzogcHJvY2Vzc1NwZWNQYXJhbShwYXJhbXMuc3BlYyksXG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NTcGVjUGFyYW0oXG4gIHNwZWM6IEN1cnJlbnRzUnVuUGFyYW1ldGVyc1tcInNwZWNcIl1cbik6IHN0cmluZ1tdIHwgdW5kZWZpbmVkIHtcbiAgaWYgKCFzcGVjKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHNwZWMpKSB7XG4gICAgcmV0dXJuIF8uZmxhdHRlbihzcGVjLm1hcCgoaSkgPT4gaS5zcGxpdChcIixcIikpKTtcbiAgfVxuXG4gIHJldHVybiBzcGVjLnNwbGl0KFwiLFwiKTtcbn1cbiIsICJpbXBvcnQgeyBBeGlvc0Vycm9yIH0gZnJvbSBcImF4aW9zXCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBzcGFjZXIsIHdhcm4gfSBmcm9tIFwiLi4vbG9nXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXliZVByaW50RXJyb3JzKFxuICBlcnI6IEF4aW9zRXJyb3I8eyBtZXNzYWdlOiBzdHJpbmc7IGVycm9ycz86IHN0cmluZ1tdIH0+XG4pIHtcbiAgaWYgKCFlcnIucmVzcG9uc2U/LmRhdGEgfHwgIWVyci5yZXNwb25zZT8uc3RhdHVzKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgeyBtZXNzYWdlLCBlcnJvcnMgfSA9IGVyci5yZXNwb25zZS5kYXRhO1xuXG4gIHN3aXRjaCAoZXJyLnJlc3BvbnNlLnN0YXR1cykge1xuICAgIGNhc2UgNDAxOlxuICAgICAgd2FybihcIlJlY2VpdmVkIDQwMSBVbmF1dGhvcml6ZWRcIik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQyMjpcbiAgICAgIHNwYWNlcigxKTtcbiAgICAgIHdhcm4oLi4uZm9ybWF0R2VuZXJpY0Vycm9yKG1lc3NhZ2UsIGVycm9ycykpO1xuICAgICAgc3BhY2VyKDEpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRHZW5lcmljRXJyb3IoXG4gIG1lc3NhZ2U/OiBzdHJpbmcsXG4gIGVycm9ycz86IHN0cmluZ1tdXG4pOiBzdHJpbmdbXSB7XG4gIGlmICghXy5pc1N0cmluZyhtZXNzYWdlKSkge1xuICAgIHJldHVybiBbXCJVbmV4cGVjdGVkIGVycm9yIGZyb20gdGhlIGNsb3VkIHNlcnZpY2VcIl07XG4gIH1cblxuICBpZiAoZXJyb3JzPy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW21lc3NhZ2UgYXMgc3RyaW5nXTtcbiAgfVxuICByZXR1cm4gW1xuICAgIG1lc3NhZ2UgYXMgc3RyaW5nLFxuICAgIGBcbiR7KGVycm9ycyA/PyBbXSkubWFwKChlKSA9PiBgICAtICR7ZX1gKS5qb2luKFwiXFxuXCIpfVxuYCxcbiAgXTtcbn1cbiIsICJpbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBtYWdlbnRhIH0gZnJvbSBcIi4uL2xvZ1wiO1xuXG5pbXBvcnQgeyBpbmZvLCBzcGFjZXIsIHdhcm4gfSBmcm9tIFwiLi4vbG9nXCI7XG5pbXBvcnQgeyBDbG91ZFdhcm5pbmcgfSBmcm9tIFwiLi90eXBlc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJpbnRXYXJuaW5ncyh3YXJuaW5nczogQ2xvdWRXYXJuaW5nW10pIHtcbiAgd2FybihcIk5vdGljZSBmcm9tIGNsb3VkIHNlcnZpY2U6XCIpO1xuICB3YXJuaW5ncy5tYXAoKHcpID0+IHtcbiAgICBzcGFjZXIoMSk7XG4gICAgaW5mbyhtYWdlbnRhLmJvbGQody5tZXNzYWdlKSk7XG4gICAgT2JqZWN0LmVudHJpZXMoXy5vbWl0KHcsIFwibWVzc2FnZVwiKSkubWFwKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgIGluZm8oXCItICVzOiAlc1wiLCBrZXksIHZhbHVlKTtcbiAgICB9KTtcbiAgICBzcGFjZXIoMSk7XG4gIH0pO1xufVxuIiwgImltcG9ydCB7IG1ha2VSZXF1ZXN0IH0gZnJvbSBcIi4uL2h0dHBDbGllbnRcIjtcbmltcG9ydCB7XG4gIENyZWF0ZVJ1blBheWxvYWQsXG4gIENyZWF0ZVJ1blJlc3BvbnNlLFxuICBJbnN0YW5jZUFQSVBheWxvYWQsXG59IGZyb20gXCIuL3R5cGVzXCI7XG5pbXBvcnQgeyBwcmludFdhcm5pbmdzIH0gZnJvbSBcIi4vd2FybmluZ3NcIjtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVJ1biA9IGFzeW5jIChwYXlsb2FkOiBDcmVhdGVSdW5QYXlsb2FkKSA9PiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgbWFrZVJlcXVlc3Q8Q3JlYXRlUnVuUmVzcG9uc2UsIENyZWF0ZVJ1blBheWxvYWQ+KHtcbiAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgIHVybDogXCIvcnVuc1wiLFxuICAgIGRhdGE6IHBheWxvYWQsXG4gIH0pO1xuXG4gIGlmICgocmVzcG9uc2UuZGF0YS53YXJuaW5ncz8ubGVuZ3RoID8/IDApID4gMCkge1xuICAgIHByaW50V2FybmluZ3MocmVzcG9uc2UuZGF0YS53YXJuaW5ncyk7XG4gIH1cblxuICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVJbnN0YW5jZSA9IGFzeW5jICh7XG4gIHJ1bklkLFxuICBncm91cElkLFxuICBtYWNoaW5lSWQsXG4gIHBsYXRmb3JtLFxufTogSW5zdGFuY2VBUElQYXlsb2FkLkNyZWF0ZUluc3RhbmNlUGF5bG9hZCkgPT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IG1ha2VSZXF1ZXN0PFxuICAgIEluc3RhbmNlQVBJUGF5bG9hZC5DcmVhdGVJbnN0YW5jZVJlc3BvbnNlLFxuICAgIEluc3RhbmNlQVBJUGF5bG9hZC5DcmVhdGVJbnN0YW5jZVBheWxvYWRcbiAgPih7XG4gICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICB1cmw6IGBydW5zLyR7cnVuSWR9L2luc3RhbmNlc2AsXG4gICAgZGF0YToge1xuICAgICAgcnVuSWQsXG4gICAgICBncm91cElkLFxuICAgICAgbWFjaGluZUlkLFxuICAgICAgcGxhdGZvcm0sXG4gICAgfSxcbiAgfSk7XG5cbiAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG59O1xuXG5leHBvcnQgY29uc3QgY3JlYXRlQmF0Y2hlZEluc3RhbmNlcyA9IGFzeW5jIChcbiAgZGF0YTogSW5zdGFuY2VBUElQYXlsb2FkLkNyZWF0ZUluc3RhbmNlQ3lQYXlsb2FkXG4pID0+IHtcbiAgY29uc3QgcmVzcG9uZSA9IGF3YWl0IG1ha2VSZXF1ZXN0PFxuICAgIEluc3RhbmNlQVBJUGF5bG9hZC5DcmVhdGVJbnN0YW5jZXNSZXNwb25zZSxcbiAgICBJbnN0YW5jZUFQSVBheWxvYWQuQ3JlYXRlSW5zdGFuY2VDeVBheWxvYWRcbiAgPih7XG4gICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICB1cmw6IGBydW5zLyR7ZGF0YS5ydW5JZH0vY3kvaW5zdGFuY2VzYCxcbiAgICBkYXRhLFxuICB9KTtcblxuICByZXR1cm4gcmVzcG9uZS5kYXRhO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldEluc3RhbmNlVGVzdHMgPSAoXG4gIGluc3RhbmNlSWQ6IHN0cmluZyxcbiAgcGF5bG9hZDogSW5zdGFuY2VBUElQYXlsb2FkLlNldEluc3RhbmNlVGVzdHNQYXlsb2FkXG4pID0+XG4gIG1ha2VSZXF1ZXN0PHt9LCBJbnN0YW5jZUFQSVBheWxvYWQuU2V0SW5zdGFuY2VUZXN0c1BheWxvYWQ+KHtcbiAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgIHVybDogYGluc3RhbmNlcy8ke2luc3RhbmNlSWR9L3Rlc3RzYCxcbiAgICBkYXRhOiBwYXlsb2FkLFxuICB9KS50aGVuKChyZXN1bHQpID0+IHJlc3VsdC5kYXRhKTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZUluc3RhbmNlUmVzdWx0cyA9IChcbiAgaW5zdGFuY2VJZDogc3RyaW5nLFxuICBwYXlsb2FkOiBJbnN0YW5jZUFQSVBheWxvYWQuVXBkYXRlSW5zdGFuY2VSZXN1bHRzUGF5bG9hZFxuKSA9PlxuICBtYWtlUmVxdWVzdDxcbiAgICBJbnN0YW5jZUFQSVBheWxvYWQuVXBkYXRlSW5zdGFuY2VSZXN1bHRzUmVzcG9uc2UsXG4gICAgSW5zdGFuY2VBUElQYXlsb2FkLlVwZGF0ZUluc3RhbmNlUmVzdWx0c1BheWxvYWRcbiAgPih7XG4gICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICB1cmw6IGBpbnN0YW5jZXMvJHtpbnN0YW5jZUlkfS9yZXN1bHRzYCxcbiAgICBkYXRhOiBwYXlsb2FkLFxuICB9KS50aGVuKChyZXN1bHQpID0+IHJlc3VsdC5kYXRhKTtcblxuZXhwb3J0IGNvbnN0IHJlcG9ydEluc3RhbmNlUmVzdWx0c01lcmdlZCA9IChcbiAgaW5zdGFuY2VJZDogc3RyaW5nLFxuICBwYXlsb2FkOiBJbnN0YW5jZUFQSVBheWxvYWQuVXBkYXRlSW5zdGFuY2VSZXN1bHRzTWVyZ2VkUGF5bG9hZFxuKSA9PlxuICBtYWtlUmVxdWVzdDxcbiAgICBJbnN0YW5jZUFQSVBheWxvYWQuVXBkYXRlSW5zdGFuY2VSZXN1bHRzUmVzcG9uc2UsXG4gICAgSW5zdGFuY2VBUElQYXlsb2FkLlVwZGF0ZUluc3RhbmNlUmVzdWx0c01lcmdlZFBheWxvYWRcbiAgPih7XG4gICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICB1cmw6IGBpbnN0YW5jZXMvJHtpbnN0YW5jZUlkfS9jeS9yZXN1bHRzYCxcbiAgICBkYXRhOiBwYXlsb2FkLFxuICB9KS50aGVuKChyZXN1bHQpID0+IHJlc3VsdC5kYXRhKTtcblxuZXhwb3J0IGNvbnN0IHVwZGF0ZUluc3RhbmNlU3Rkb3V0ID0gKGluc3RhbmNlSWQ6IHN0cmluZywgc3Rkb3V0OiBzdHJpbmcpID0+XG4gIG1ha2VSZXF1ZXN0PGFueSwgeyBzdGRvdXQ6IHN0cmluZyB9Pih7XG4gICAgbWV0aG9kOiBcIlBVVFwiLFxuICAgIHVybDogYGluc3RhbmNlcy8ke2luc3RhbmNlSWR9L3N0ZG91dGAsXG4gICAgZGF0YToge1xuICAgICAgc3Rkb3V0LFxuICAgIH0sXG4gIH0pO1xuIiwgIi8qISBAcHJlc2VydmVcblxuIyMjIE1JVFxuXG5QYXJ0cyBvZiB0aGlzIGNvZGUgd2FzIGNvcGllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9jeXByZXNzLWlvL2N5cHJlc3MgYW5kIGlzIHN1YmplY3QgdG8gTUlUIGxpY2Vuc2UuXG5cbk1JVCBMaWNlbnNlXG5cbkNvcHlyaWdodCAoYykgMjAyMiBDeXByZXNzLmlvXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG5jb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG5TT0ZUV0FSRS5cbiovXG5cbmltcG9ydCBkZWJ1Z0ZuIGZyb20gXCJkZWJ1Z1wiO1xuXG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBWYWxpZGF0aW9uRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnNcIjtcblxuY29uc3QgZGVidWcgPSBkZWJ1Z0ZuKFwiY3VycmVudHM6Y2lcIik7XG5cbmNvbnN0IGpvaW4gPSAoY2hhcjogc3RyaW5nLCAuLi5waWVjZXM6IChzdHJpbmcgfCB1bmRlZmluZWQpW10pID0+IHtcbiAgcmV0dXJuIF8uY2hhaW4ocGllY2VzKS5jb21wYWN0KCkuam9pbihjaGFyKS52YWx1ZSgpO1xufTtcblxuY29uc3QgdG9DYW1lbE9iamVjdCA9IChvYmo6IGFueSwga2V5OiBzdHJpbmcpID0+IHtcbiAgcmV0dXJuIF8uc2V0KG9iaiwgXy5jYW1lbENhc2Uoa2V5KSwgcHJvY2Vzcy5lbnZba2V5XSk7XG59O1xuXG5jb25zdCBleHRyYWN0ID0gKGVudktleXM6IHN0cmluZ1tdKSA9PiB7XG4gIHJldHVybiBfLnRyYW5zZm9ybShlbnZLZXlzLCB0b0NhbWVsT2JqZWN0LCB7fSk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBydW5uaW5nIG9uIFRlYW1Gb3VuZGF0aW9uIHNlcnZlci5cbiAqIEBzZWUgaHR0cHM6Ly90ZWNobmV0Lm1pY3Jvc29mdC5jb20vZW4tdXMvaGg4NTA0NDgodj12cy45MilcbiAqL1xuY29uc3QgaXNUZWFtRm91bmRhdGlvbiA9ICgpID0+IHtcbiAgcmV0dXJuIHByb2Nlc3MuZW52LlRGX0JVSUxEICYmIHByb2Nlc3MuZW52LlRGX0JVSUxEX0JVSUxETlVNQkVSO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgcnVubmluZyBvbiBBenVyZSBDSSBwaXBlbGluZS5cbiAqIFNlZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgaW4gdGhlIGlzc3VlICMzNjU3XG4gKiBAc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jeXByZXNzLWlvL2N5cHJlc3MvaXNzdWVzLzM2NTdcbiAqL1xuY29uc3QgaXNBenVyZUNpID0gKCkgPT4ge1xuICByZXR1cm4gcHJvY2Vzcy5lbnYuVEZfQlVJTEQgJiYgcHJvY2Vzcy5lbnYuQVpVUkVfSFRUUF9VU0VSX0FHRU5UO1xufTtcblxuY29uc3QgaXNBV1NDb2RlQnVpbGQgPSAoKSA9PiB7XG4gIHJldHVybiBfLnNvbWUocHJvY2Vzcy5lbnYsICh2YWwsIGtleSkgPT4ge1xuICAgIHJldHVybiAvXkNPREVCVUlMRF8vLnRlc3Qoa2V5KTtcbiAgfSk7XG59O1xuXG5jb25zdCBpc0JhbWJvbyA9ICgpID0+IHtcbiAgcmV0dXJuIHByb2Nlc3MuZW52LmJhbWJvb19idWlsZE51bWJlcjtcbn07XG5cbmNvbnN0IGlzQ29kZXNoaXBCYXNpYyA9ICgpID0+IHtcbiAgcmV0dXJuIChcbiAgICBwcm9jZXNzLmVudi5DSV9OQU1FICYmXG4gICAgcHJvY2Vzcy5lbnYuQ0lfTkFNRSA9PT0gXCJjb2Rlc2hpcFwiICYmXG4gICAgcHJvY2Vzcy5lbnYuQ09ERVNISVBcbiAgKTtcbn07XG5cbmNvbnN0IGlzQ29kZXNoaXBQcm8gPSAoKSA9PiB7XG4gIHJldHVybiAoXG4gICAgcHJvY2Vzcy5lbnYuQ0lfTkFNRSAmJlxuICAgIHByb2Nlc3MuZW52LkNJX05BTUUgPT09IFwiY29kZXNoaXBcIiAmJlxuICAgICFwcm9jZXNzLmVudi5DT0RFU0hJUFxuICApO1xufTtcblxuY29uc3QgaXNDb25jb3Vyc2UgPSAoKSA9PiB7XG4gIHJldHVybiBfLnNvbWUocHJvY2Vzcy5lbnYsICh2YWwsIGtleSkgPT4ge1xuICAgIHJldHVybiAvXkNPTkNPVVJTRV8vLnRlc3Qoa2V5KTtcbiAgfSk7XG59O1xuXG5jb25zdCBpc0dpdGxhYiA9ICgpID0+IHtcbiAgcmV0dXJuIChcbiAgICBwcm9jZXNzLmVudi5HSVRMQUJfQ0kgfHxcbiAgICAocHJvY2Vzcy5lbnYuQ0lfU0VSVkVSX05BTUUgJiYgL15HaXRMYWIvLnRlc3QocHJvY2Vzcy5lbnYuQ0lfU0VSVkVSX05BTUUpKVxuICApO1xufTtcblxuY29uc3QgaXNHb29nbGVDbG91ZCA9ICgpID0+IHtcbiAgLy8gc2V0IGF1dG9tYXRpY2FsbHkgZm9yIHRoZSBOb2RlLmpzIDYsIE5vZGUuanMgOCBydW50aW1lcyAobm90IGluIE5vZGUgMTApXG4gIC8vIFRPRE86IG1heSBhbHNvIHBvdGVudGlhbGx5IGhhdmUgWF9HT09HTEVfKiBlbnYgdmFyIHNldFxuICAvLyBodHRwczovL2Nsb3VkLmdvb2dsZS5jb20vZnVuY3Rpb25zL2RvY3MvZW52LXZhciNlbnZpcm9ubWVudF92YXJpYWJsZXNfc2V0X2F1dG9tYXRpY2FsbHlcbiAgcmV0dXJuIChcbiAgICBwcm9jZXNzLmVudi5HQ1BfUFJPSkVDVCB8fFxuICAgIHByb2Nlc3MuZW52LkdDTE9VRF9QUk9KRUNUIHx8XG4gICAgcHJvY2Vzcy5lbnYuR09PR0xFX0NMT1VEX1BST0pFQ1RcbiAgKTtcbn07XG5cbmNvbnN0IGlzSmVua2lucyA9ICgpID0+IHtcbiAgcmV0dXJuIChcbiAgICBwcm9jZXNzLmVudi5KRU5LSU5TX1VSTCB8fFxuICAgIHByb2Nlc3MuZW52LkpFTktJTlNfSE9NRSB8fFxuICAgIHByb2Nlc3MuZW52LkpFTktJTlNfVkVSU0lPTiB8fFxuICAgIHByb2Nlc3MuZW52LkhVRFNPTl9VUkwgfHxcbiAgICBwcm9jZXNzLmVudi5IVURTT05fSE9NRVxuICApO1xufTtcblxuY29uc3QgaXNXZXJja2VyID0gKCkgPT4ge1xuICByZXR1cm4gcHJvY2Vzcy5lbnYuV0VSQ0tFUiB8fCBwcm9jZXNzLmVudi5XRVJDS0VSX01BSU5fUElQRUxJTkVfU1RBUlRFRDtcbn07XG5cbi8qKlxuICogV2UgZGV0ZWN0IENJIHByb3ZpZGVycyBieSBkZXRlY3RpbmcgYW4gZW52aXJvbm1lbnQgdmFyaWFibGVcbiAqIHVuaXF1ZSB0byB0aGUgcHJvdmlkZXIsIG9yIGJ5IGNhbGxpbmcgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdHJ1ZVxuICogZm9yIHRoYXQgcHJvdmlkZXIuXG4gKlxuICogRm9yIGV4YW1wbGUsIEFwcFZleW9yIENJIGhhcyBlbnZpcm9ubWVudCB0aGVcbiAqIHZhcmlhYmxlIFwiQVBQVkVZT1JcIiBzZXQgZHVyaW5nIHJ1blxuICovXG5jb25zdCBDSV9QUk9WSURFUlMgPSB7XG4gIGFwcHZleW9yOiBcIkFQUFZFWU9SXCIsXG4gIGF6dXJlOiBpc0F6dXJlQ2ksXG4gIGF3c0NvZGVCdWlsZDogaXNBV1NDb2RlQnVpbGQsXG4gIGJhbWJvbzogaXNCYW1ib28sXG4gIGJpdGJ1Y2tldDogXCJCSVRCVUNLRVRfQlVJTERfTlVNQkVSXCIsXG4gIGJ1aWxka2l0ZTogXCJCVUlMREtJVEVcIixcbiAgY2lyY2xlOiBcIkNJUkNMRUNJXCIsXG4gIGNvZGVzaGlwQmFzaWM6IGlzQ29kZXNoaXBCYXNpYyxcbiAgY29kZXNoaXBQcm86IGlzQ29kZXNoaXBQcm8sXG4gIGNvbmNvdXJzZTogaXNDb25jb3Vyc2UsXG4gIGNvZGVGcmVzaDogXCJDRl9CVUlMRF9JRFwiLFxuICBkcm9uZTogXCJEUk9ORVwiLFxuICBnaXRodWJBY3Rpb25zOiBcIkdJVEhVQl9BQ1RJT05TXCIsXG4gIGdpdGxhYjogaXNHaXRsYWIsXG4gIGdvQ0Q6IFwiR09fSk9CX05BTUVcIixcbiAgZ29vZ2xlQ2xvdWQ6IGlzR29vZ2xlQ2xvdWQsXG4gIGplbmtpbnM6IGlzSmVua2lucyxcbiAgc2VtYXBob3JlOiBcIlNFTUFQSE9SRVwiLFxuICBzaGlwcGFibGU6IFwiU0hJUFBBQkxFXCIsXG4gIHRlYW1jaXR5OiBcIlRFQU1DSVRZX1ZFUlNJT05cIixcbiAgdGVhbWZvdW5kYXRpb246IGlzVGVhbUZvdW5kYXRpb24sXG4gIHRyYXZpczogXCJUUkFWSVNcIixcbiAgd2VyY2tlcjogaXNXZXJja2VyLFxuICBuZXRsaWZ5OiBcIk5FVExJRllcIixcbiAgbGF5ZXJjaTogXCJMQVlFUkNJXCIsXG59O1xuXG5mdW5jdGlvbiBfZGV0ZWN0UHJvdmlkZXJOYW1lKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGNvbnN0IHsgZW52IH0gPSBwcm9jZXNzO1xuICAvLyByZXR1cm4gdGhlIGtleSBvZiB0aGUgZmlyc3QgcHJvdmlkZXJcbiAgLy8gd2hpY2ggaXMgdHJ1dGh5XG5cbiAgcmV0dXJuIF8uZmluZEtleShDSV9QUk9WSURFUlMsICh2YWx1ZSkgPT4ge1xuICAgIGlmIChfLmlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGVudlt2YWx1ZV07XG4gICAgfVxuXG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZSgpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIFRPRE86IGRvbid0IGZvciBhYm91dCBidWlsZE51bWJlciFcbi8vIGxvb2sgYXQgdGhlIG9sZCBjb21taXQgdGhhdCB3YXMgcmVtb3ZlZCB0byBzZWUgaG93IHdlIGRpZCBpdFxuY29uc3QgX3Byb3ZpZGVyQ2lQYXJhbXMgPSAoKTogUHJvdmlkZXJDaVBhcmFtc1JlcyA9PiB7XG4gIHJldHVybiB7XG4gICAgYXBwdmV5b3I6IGV4dHJhY3QoW1xuICAgICAgXCJBUFBWRVlPUl9KT0JfSURcIixcbiAgICAgIFwiQVBQVkVZT1JfQUNDT1VOVF9OQU1FXCIsXG4gICAgICBcIkFQUFZFWU9SX1BST0pFQ1RfU0xVR1wiLFxuICAgICAgXCJBUFBWRVlPUl9CVUlMRF9OVU1CRVJcIixcbiAgICAgIFwiQVBQVkVZT1JfQlVJTERfVkVSU0lPTlwiLFxuICAgICAgXCJBUFBWRVlPUl9QVUxMX1JFUVVFU1RfTlVNQkVSXCIsXG4gICAgICBcIkFQUFZFWU9SX1BVTExfUkVRVUVTVF9IRUFEX1JFUE9fQlJBTkNIXCIsXG4gICAgXSksXG4gICAgYXp1cmU6IGV4dHJhY3QoW1xuICAgICAgXCJCVUlMRF9CVUlMRElEXCIsXG4gICAgICBcIkJVSUxEX0JVSUxETlVNQkVSXCIsXG4gICAgICBcIkJVSUxEX0NPTlRBSU5FUklEXCIsXG4gICAgICBcIkJVSUxEX1JFUE9TSVRPUllfVVJJXCIsXG4gICAgXSksXG4gICAgYXdzQ29kZUJ1aWxkOiBleHRyYWN0KFtcbiAgICAgIFwiQ09ERUJVSUxEX0JVSUxEX0lEXCIsXG4gICAgICBcIkNPREVCVUlMRF9CVUlMRF9OVU1CRVJcIixcbiAgICAgIFwiQ09ERUJVSUxEX1JFU09MVkVEX1NPVVJDRV9WRVJTSU9OXCIsXG4gICAgICBcIkNPREVCVUlMRF9TT1VSQ0VfUkVQT19VUkxcIixcbiAgICAgIFwiQ09ERUJVSUxEX1NPVVJDRV9WRVJTSU9OXCIsXG4gICAgXSksXG4gICAgYmFtYm9vOiBleHRyYWN0KFtcbiAgICAgIFwiYmFtYm9vX2J1aWxkTnVtYmVyXCIsXG4gICAgICBcImJhbWJvb19idWlsZFJlc3VsdHNVcmxcIixcbiAgICAgIFwiYmFtYm9vX3BsYW5SZXBvc2l0b3J5X3JlcG9zaXRvcnlVcmxcIixcbiAgICAgIFwiYmFtYm9vX2J1aWxkS2V5XCIsXG4gICAgXSksXG4gICAgYml0YnVja2V0OiBleHRyYWN0KFtcbiAgICAgIFwiQklUQlVDS0VUX1JFUE9fU0xVR1wiLFxuICAgICAgXCJCSVRCVUNLRVRfUkVQT19PV05FUlwiLFxuICAgICAgXCJCSVRCVUNLRVRfQlVJTERfTlVNQkVSXCIsXG4gICAgICBcIkJJVEJVQ0tFVF9QQVJBTExFTF9TVEVQXCIsXG4gICAgICBcIkJJVEJVQ0tFVF9TVEVQX1JVTl9OVU1CRVJcIixcbiAgICAgIC8vIHRoZSBQUiB2YXJpYWJsZXMgYXJlIG9ubHkgc2V0IG9uIHB1bGwgcmVxdWVzdCBidWlsZHNcbiAgICAgIFwiQklUQlVDS0VUX1BSX0lEXCIsXG4gICAgICBcIkJJVEJVQ0tFVF9QUl9ERVNUSU5BVElPTl9CUkFOQ0hcIixcbiAgICAgIFwiQklUQlVDS0VUX1BSX0RFU1RJTkFUSU9OX0NPTU1JVFwiLFxuICAgIF0pLFxuICAgIGJ1aWxka2l0ZTogZXh0cmFjdChbXG4gICAgICBcIkJVSUxES0lURV9SRVBPXCIsXG4gICAgICBcIkJVSUxES0lURV9TT1VSQ0VcIixcbiAgICAgIFwiQlVJTERLSVRFX0pPQl9JRFwiLFxuICAgICAgXCJCVUlMREtJVEVfQlVJTERfSURcIixcbiAgICAgIFwiQlVJTERLSVRFX0JVSUxEX1VSTFwiLFxuICAgICAgXCJCVUlMREtJVEVfQlVJTERfTlVNQkVSXCIsXG4gICAgICBcIkJVSUxES0lURV9QVUxMX1JFUVVFU1RcIixcbiAgICAgIFwiQlVJTERLSVRFX1BVTExfUkVRVUVTVF9SRVBPXCIsXG4gICAgICBcIkJVSUxES0lURV9QVUxMX1JFUVVFU1RfQkFTRV9CUkFOQ0hcIixcbiAgICBdKSxcbiAgICBjaXJjbGU6IGV4dHJhY3QoW1xuICAgICAgXCJDSVJDTEVfSk9CXCIsXG4gICAgICBcIkNJUkNMRV9CVUlMRF9OVU1cIixcbiAgICAgIFwiQ0lSQ0xFX0JVSUxEX1VSTFwiLFxuICAgICAgXCJDSVJDTEVfUFJfTlVNQkVSXCIsXG4gICAgICBcIkNJUkNMRV9QUl9SRVBPTkFNRVwiLFxuICAgICAgXCJDSVJDTEVfUFJfVVNFUk5BTUVcIixcbiAgICAgIFwiQ0lSQ0xFX0NPTVBBUkVfVVJMXCIsXG4gICAgICBcIkNJUkNMRV9XT1JLRkxPV19JRFwiLFxuICAgICAgXCJDSVJDTEVfUFVMTF9SRVFVRVNUXCIsXG4gICAgICBcIkNJUkNMRV9SRVBPU0lUT1JZX1VSTFwiLFxuICAgICAgXCJDSV9QVUxMX1JFUVVFU1RcIixcbiAgICBdKSxcbiAgICBjb2Rlc2hpcEJhc2ljOiBleHRyYWN0KFtcbiAgICAgIFwiQ0lfQlVJTERfSURcIixcbiAgICAgIFwiQ0lfUkVQT19OQU1FXCIsXG4gICAgICBcIkNJX0JVSUxEX1VSTFwiLFxuICAgICAgXCJDSV9QUk9KRUNUX0lEXCIsXG4gICAgICBcIkNJX0JVSUxEX05VTUJFUlwiLFxuICAgICAgXCJDSV9QVUxMX1JFUVVFU1RcIixcbiAgICBdKSxcbiAgICAvLyBDb2Rlc2hpcFBybyBwcm92aWRlcyB2ZXJ5IGZldyBDSSB2YXJpYWJsZXNcbiAgICAvLyBodHRwczovL2RvY3VtZW50YXRpb24uY29kZXNoaXAuY29tL3Byby9idWlsZHMtYW5kLWNvbmZpZ3VyYXRpb24vZW52aXJvbm1lbnQtdmFyaWFibGVzL1xuICAgIGNvZGVzaGlwUHJvOiBleHRyYWN0KFtcIkNJX0JVSUxEX0lEXCIsIFwiQ0lfUkVQT19OQU1FXCIsIFwiQ0lfUFJPSkVDVF9JRFwiXSksXG4gICAgLy8gaHR0cHM6Ly9jb25jb3Vyc2UtY2kub3JnL2ltcGxlbWVudGluZy1yZXNvdXJjZS10eXBlcy5odG1sI3Jlc291cmNlLW1ldGFkYXRhXG4gICAgY29uY291cnNlOiBleHRyYWN0KFtcbiAgICAgIFwiQlVJTERfSURcIixcbiAgICAgIFwiQlVJTERfTkFNRVwiLFxuICAgICAgXCJCVUlMRF9KT0JfTkFNRVwiLFxuICAgICAgXCJCVUlMRF9QSVBFTElORV9OQU1FXCIsXG4gICAgICBcIkJVSUxEX1RFQU1fTkFNRVwiLFxuICAgICAgXCJBVENfRVhURVJOQUxfVVJMXCIsXG4gICAgXSksXG4gICAgLy8gaHR0cHM6Ly9jb2RlZnJlc2guaW8vZG9jcy9kb2NzL2NvZGVmcmVzaC15YW1sL3ZhcmlhYmxlcy9cbiAgICBjb2RlRnJlc2g6IGV4dHJhY3QoW1xuICAgICAgXCJDRl9CVUlMRF9JRFwiLFxuICAgICAgXCJDRl9CVUlMRF9VUkxcIixcbiAgICAgIFwiQ0ZfQ1VSUkVOVF9BVFRFTVBUXCIsXG4gICAgICBcIkNGX1NURVBfTkFNRVwiLFxuICAgICAgXCJDRl9QSVBFTElORV9OQU1FXCIsXG4gICAgICBcIkNGX1BJUEVMSU5FX1RSSUdHRVJfSURcIixcbiAgICAgIC8vIHZhcmlhYmxlcyBhZGRlZCBmb3IgcHVsbCByZXF1ZXN0c1xuICAgICAgXCJDRl9QVUxMX1JFUVVFU1RfSURcIixcbiAgICAgIFwiQ0ZfUFVMTF9SRVFVRVNUX0lTX0ZPUktcIixcbiAgICAgIFwiQ0ZfUFVMTF9SRVFVRVNUX05VTUJFUlwiLFxuICAgICAgXCJDRl9QVUxMX1JFUVVFU1RfVEFSR0VUXCIsXG4gICAgXSksXG4gICAgZHJvbmU6IGV4dHJhY3QoW1xuICAgICAgXCJEUk9ORV9KT0JfTlVNQkVSXCIsXG4gICAgICBcIkRST05FX0JVSUxEX0xJTktcIixcbiAgICAgIFwiRFJPTkVfQlVJTERfTlVNQkVSXCIsXG4gICAgICBcIkRST05FX1BVTExfUkVRVUVTVFwiLFxuICAgIF0pLFxuICAgIC8vIGh0dHBzOi8vaGVscC5naXRodWIuY29tL2VuL2FjdGlvbnMvYXV0b21hdGluZy15b3VyLXdvcmtmbG93LXdpdGgtZ2l0aHViLWFjdGlvbnMvdXNpbmctZW52aXJvbm1lbnQtdmFyaWFibGVzI2RlZmF1bHQtZW52aXJvbm1lbnQtdmFyaWFibGVzXG4gICAgZ2l0aHViQWN0aW9uczogZXh0cmFjdChbXG4gICAgICBcIkdJVEhVQl9XT1JLRkxPV1wiLFxuICAgICAgXCJHSVRIVUJfQUNUSU9OXCIsXG4gICAgICBcIkdJVEhVQl9FVkVOVF9OQU1FXCIsXG4gICAgICBcIkdJVEhVQl9SVU5fSURcIixcbiAgICAgIFwiR0lUSFVCX1JVTl9BVFRFTVBUXCIsXG4gICAgICBcIkdJVEhVQl9SRVBPU0lUT1JZXCIsXG4gICAgXSksXG4gICAgLy8gc2VlIGh0dHBzOi8vZG9jcy5naXRsYWIuY29tL2VlL2NpL3ZhcmlhYmxlcy9cbiAgICBnaXRsYWI6IGV4dHJhY3QoW1xuICAgICAgLy8gcGlwZWxpbmUgaXMgY29tbW9uIGFtb25nIGFsbCBqb2JzXG4gICAgICBcIkNJX1BJUEVMSU5FX0lEXCIsXG4gICAgICBcIkNJX1BJUEVMSU5FX1VSTFwiLFxuICAgICAgLy8gaW5kaXZpZHVhbCBqb2JzXG4gICAgICBcIkNJX0JVSUxEX0lEXCIsIC8vIGJ1aWxkIGlkIGFuZCBqb2IgaWQgYXJlIGFsaWFzZXNcbiAgICAgIFwiQ0lfSk9CX0lEXCIsXG4gICAgICBcIkNJX0pPQl9VUkxcIixcbiAgICAgIFwiQ0lfSk9CX05BTUVcIixcbiAgICAgIC8vIG90aGVyIGluZm9ybWF0aW9uXG4gICAgICBcIkdJVExBQl9IT1NUXCIsXG4gICAgICBcIkNJX1BST0pFQ1RfSURcIixcbiAgICAgIFwiQ0lfUFJPSkVDVF9VUkxcIixcbiAgICAgIFwiQ0lfUkVQT1NJVE9SWV9VUkxcIixcbiAgICAgIFwiQ0lfRU5WSVJPTk1FTlRfVVJMXCIsXG4gICAgICBcIkNJX0RFRkFVTFRfQlJBTkNIXCIsXG4gICAgICAvLyBmb3IgUFJzOiBodHRwczovL2dpdGxhYi5jb20vZ2l0bGFiLW9yZy9naXRsYWItY2UvaXNzdWVzLzIzOTAyXG4gICAgXSksXG4gICAgLy8gaHR0cHM6Ly9kb2NzLmdvY2Qub3JnL2N1cnJlbnQvZmFxL2Rldl91c2VfY3VycmVudF9yZXZpc2lvbl9pbl9idWlsZC5odG1sI3N0YW5kYXJkLWdvY2QtZW52aXJvbm1lbnQtdmFyaWFibGVzXG4gICAgZ29DRDogZXh0cmFjdChbXG4gICAgICBcIkdPX1NFUlZFUl9VUkxcIixcbiAgICAgIFwiR09fRU5WSVJPTk1FTlRfTkFNRVwiLFxuICAgICAgXCJHT19QSVBFTElORV9OQU1FXCIsXG4gICAgICBcIkdPX1BJUEVMSU5FX0NPVU5URVJcIixcbiAgICAgIFwiR09fUElQRUxJTkVfTEFCRUxcIixcbiAgICAgIFwiR09fU1RBR0VfTkFNRVwiLFxuICAgICAgXCJHT19TVEFHRV9DT1VOVEVSXCIsXG4gICAgICBcIkdPX0pPQl9OQU1FXCIsXG4gICAgICBcIkdPX1RSSUdHRVJfVVNFUlwiLFxuICAgICAgXCJHT19SRVZJU0lPTlwiLFxuICAgICAgXCJHT19UT19SRVZJU0lPTlwiLFxuICAgICAgXCJHT19GUk9NX1JFVklTSU9OXCIsXG4gICAgICBcIkdPX01BVEVSSUFMX0hBU19DSEFOR0VEXCIsXG4gICAgXSksXG4gICAgZ29vZ2xlQ2xvdWQ6IGV4dHJhY3QoW1xuICAgICAgLy8gaW5kaXZpZHVhbCBqb2JzXG4gICAgICBcIkJVSUxEX0lEXCIsXG4gICAgICBcIlBST0pFQ1RfSURcIixcbiAgICAgIC8vIG90aGVyIGluZm9ybWF0aW9uXG4gICAgICBcIlJFUE9fTkFNRVwiLFxuICAgICAgXCJCUkFOQ0hfTkFNRVwiLFxuICAgICAgXCJUQUdfTkFNRVwiLFxuICAgICAgXCJDT01NSVRfU0hBXCIsXG4gICAgICBcIlNIT1JUX1NIQVwiLFxuICAgICAgLy8gaHR0cHM6Ly9jbG91ZC5nb29nbGUuY29tL2Nsb3VkLWJ1aWxkL2RvY3MvYXBpL3JlZmVyZW5jZS9yZXN0L1NoYXJlZC5UeXBlcy9CdWlsZFxuICAgIF0pLFxuICAgIGplbmtpbnM6IGV4dHJhY3QoW1wiQlVJTERfSURcIiwgXCJCVUlMRF9VUkxcIiwgXCJCVUlMRF9OVU1CRVJcIiwgXCJnaHByYlB1bGxJZFwiXSksXG4gICAgLy8gaHR0cHM6Ly9zZW1hcGhvcmVjaS5jb20vZG9jcy9hdmFpbGFibGUtZW52aXJvbm1lbnQtdmFyaWFibGVzLmh0bWxcbiAgICAvLyBzb21lIGNvbWUgZnJvbSB2MSwgc29tZSBmcm9tIHYyIG9mIHNlbWFwaG9yZVxuICAgIHNlbWFwaG9yZTogZXh0cmFjdChbXG4gICAgICBcIlNFTUFQSE9SRV9CUkFOQ0hfSURcIixcbiAgICAgIFwiU0VNQVBIT1JFX0JVSUxEX05VTUJFUlwiLFxuICAgICAgXCJTRU1BUEhPUkVfQ1VSUkVOVF9KT0JcIixcbiAgICAgIFwiU0VNQVBIT1JFX0NVUlJFTlRfVEhSRUFEXCIsXG4gICAgICBcIlNFTUFQSE9SRV9FWEVDVVRBQkxFX1VVSURcIixcbiAgICAgIFwiU0VNQVBIT1JFX0dJVF9CUkFOQ0hcIixcbiAgICAgIFwiU0VNQVBIT1JFX0dJVF9ESVJcIixcbiAgICAgIFwiU0VNQVBIT1JFX0dJVF9SRUZcIixcbiAgICAgIFwiU0VNQVBIT1JFX0dJVF9SRUZfVFlQRVwiLFxuICAgICAgXCJTRU1BUEhPUkVfR0lUX1JFUE9fU0xVR1wiLFxuICAgICAgXCJTRU1BUEhPUkVfR0lUX1NIQVwiLFxuICAgICAgXCJTRU1BUEhPUkVfR0lUX1VSTFwiLFxuICAgICAgXCJTRU1BUEhPUkVfSk9CX0NPVU5UXCIsXG4gICAgICBcIlNFTUFQSE9SRV9KT0JfSURcIiwgLy8gdjJcbiAgICAgIFwiU0VNQVBIT1JFX0pPQl9OQU1FXCIsXG4gICAgICBcIlNFTUFQSE9SRV9KT0JfVVVJRFwiLCAvLyB2MVxuICAgICAgXCJTRU1BUEhPUkVfUElQRUxJTkVfSURcIixcbiAgICAgIFwiU0VNQVBIT1JFX1BMQVRGT1JNXCIsXG4gICAgICBcIlNFTUFQSE9SRV9QUk9KRUNUX0RJUlwiLFxuICAgICAgXCJTRU1BUEhPUkVfUFJPSkVDVF9IQVNIX0lEXCIsXG4gICAgICBcIlNFTUFQSE9SRV9QUk9KRUNUX0lEXCIsIC8vIHYyXG4gICAgICBcIlNFTUFQSE9SRV9QUk9KRUNUX05BTUVcIixcbiAgICAgIFwiU0VNQVBIT1JFX1BST0pFQ1RfVVVJRFwiLCAvLyB2MVxuICAgICAgXCJTRU1BUEhPUkVfUkVQT19TTFVHXCIsXG4gICAgICBcIlNFTUFQSE9SRV9UUklHR0VSX1NPVVJDRVwiLFxuICAgICAgXCJTRU1BUEhPUkVfV09SS0ZMT1dfSURcIixcbiAgICAgIFwiUFVMTF9SRVFVRVNUX05VTUJFUlwiLCAvLyBwdWxsIHJlcXVlc3RzIGZyb20gZm9ya3MgT05MWVxuICAgIF0pLFxuICAgIC8vIHNlZSBodHRwOi8vZG9jcy5zaGlwcGFibGUuY29tL2NpL2Vudi12YXJzL1xuICAgIHNoaXBwYWJsZTogZXh0cmFjdChbXG4gICAgICAvLyBidWlsZCB2YXJpYWJsZXNcbiAgICAgIFwiU0hJUFBBQkxFX0JVSUxEX0lEXCIsIC8vIFwiNWI5MzM1NGNhYmZhYmIwNzAwN2YwMWZkXCJcbiAgICAgIFwiU0hJUFBBQkxFX0JVSUxEX05VTUJFUlwiLCAvLyBcIjRcIlxuICAgICAgXCJTSElQUEFCTEVfQ09NTUlUX1JBTkdFXCIsIC8vIFwic2hhMS4uLnNoYTJcIlxuICAgICAgXCJTSElQUEFCTEVfQ09OVEFJTkVSX05BTUVcIiwgLy8gXCJjLmV4ZWMuY3lwcmVzcy1leGFtcGxlLWtpdGNoZW5zaW5rLjQuMVwiXG4gICAgICBcIlNISVBQQUJMRV9KT0JfSURcIiwgLy8gXCIxXCJcbiAgICAgIFwiU0hJUFBBQkxFX0pPQl9OVU1CRVJcIiwgLy8gXCIxXCJcbiAgICAgIFwiU0hJUFBBQkxFX1JFUE9fU0xVR1wiLCAvLyBcIjx1c2VybmFtZT4vPHJlcG8+XCJcbiAgICAgIC8vIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gdGhhdCBTaGlwcGFibGUgcHJvdmlkZXNcbiAgICAgIFwiSVNfRk9SS1wiLCAvLyBcInRydWVcIlxuICAgICAgXCJJU19HSVRfVEFHXCIsIC8vIFwiZmFsc2VcIlxuICAgICAgXCJJU19QUkVSRUxFQVNFXCIsIC8vIFwiZmFsc2VcIlxuICAgICAgXCJJU19SRUxFQVNFXCIsIC8vIFwiZmFsc2VcIlxuICAgICAgXCJSRVBPU0lUT1JZX1VSTFwiLCAvLyBcImh0dHBzOi8vZ2l0aHViLmNvbS8uLi4uZ2l0XCJcbiAgICAgIFwiUkVQT19GVUxMX05BTUVcIiwgLy8gXCI8dXNlcm5hbWU+LzxyZXBvPlwiXG4gICAgICBcIlJFUE9fTkFNRVwiLCAvLyBcImN5cHJlc3MtZXhhbXBsZS1raXRjaGVuc2lua1wiXG4gICAgICBcIkJVSUxEX1VSTFwiLCAvLyBcImh0dHBzOi8vYXBwLnNoaXBwYWJsZS5jb20vZ2l0aHViLzx1c2VybmFtZT4vPHJlcG8+L3J1bnMvMVwiXG4gICAgICAvLyBQdWxsIHJlcXVlc3QgaW5mb3JtYXRpb25cbiAgICAgIFwiQkFTRV9CUkFOQ0hcIiwgLy8gTmFtZSBvZiB0aGUgdGFyZ2V0IGJyYW5jaCBpbnRvIHdoaWNoIHRoZSBwdWxsIHJlcXVlc3QgY2hhbmdlcyB3aWxsIGJlIG1lcmdlZC5cbiAgICAgIFwiSEVBRF9CUkFOQ0hcIiwgLy8gVGhpcyBpcyBvbmx5IHNldCBmb3IgcHVsbCByZXF1ZXN0cyBhbmQgaXMgdGhlIG5hbWUgb2YgdGhlIGJyYW5jaCB0aGUgcHVsbCByZXF1ZXN0IHdhcyBvcGVuZWQgZnJvbS5cbiAgICAgIFwiSVNfUFVMTF9SRVFVRVNUXCIsIC8vIFwiZmFsc2VcIiBvciBcInRydWVcIlxuICAgICAgXCJQVUxMX1JFUVVFU1RcIiwgLy8gUHVsbCByZXF1ZXN0IG51bWJlciBpZiB0aGUgam9iIGlzIGEgcHVsbCByZXF1ZXN0LiBJZiBub3QsIHRoaXMgd2lsbCBiZSBzZXQgdG8gZmFsc2UuXG4gICAgICBcIlBVTExfUkVRVUVTVF9CQVNFX0JSQU5DSFwiLCAvLyBOYW1lIG9mIHRoZSBicmFuY2ggdGhhdCB0aGUgcHVsbCByZXF1ZXN0IHdpbGwgYmUgbWVyZ2VkIGludG8uIEl0IHNob3VsZCBiZSB0aGUgc2FtZSBhcyBCQVNFX0JSQU5DSC5cbiAgICAgIFwiUFVMTF9SRVFVRVNUX1JFUE9fRlVMTF9OQU1FXCIsIC8vIEZ1bGwgbmFtZSBvZiB0aGUgcmVwb3NpdG9yeSBmcm9tIHdoZXJlIHRoZSBwdWxsIHJlcXVlc3Qgb3JpZ2luYXRlZC5cbiAgICBdKSxcbiAgICB0ZWFtY2l0eTogbnVsbCxcbiAgICB0ZWFtZm91bmRhdGlvbjogZXh0cmFjdChbXG4gICAgICBcIkJVSUxEX0JVSUxESURcIixcbiAgICAgIFwiQlVJTERfQlVJTEROVU1CRVJcIixcbiAgICAgIFwiQlVJTERfQ09OVEFJTkVSSURcIixcbiAgICBdKSxcbiAgICB0cmF2aXM6IGV4dHJhY3QoW1xuICAgICAgXCJUUkFWSVNfSk9CX0lEXCIsXG4gICAgICBcIlRSQVZJU19CVUlMRF9JRFwiLFxuICAgICAgXCJUUkFWSVNfQlVJTERfV0VCX1VSTFwiLFxuICAgICAgXCJUUkFWSVNfUkVQT19TTFVHXCIsXG4gICAgICBcIlRSQVZJU19KT0JfTlVNQkVSXCIsXG4gICAgICBcIlRSQVZJU19FVkVOVF9UWVBFXCIsXG4gICAgICBcIlRSQVZJU19DT01NSVRfUkFOR0VcIixcbiAgICAgIFwiVFJBVklTX0JVSUxEX05VTUJFUlwiLFxuICAgICAgXCJUUkFWSVNfUFVMTF9SRVFVRVNUXCIsXG4gICAgICBcIlRSQVZJU19QVUxMX1JFUVVFU1RfQlJBTkNIXCIsXG4gICAgICBcIlRSQVZJU19QVUxMX1JFUVVFU1RfU0hBXCIsXG4gICAgXSksXG4gICAgd2VyY2tlcjogbnVsbCxcbiAgICAvLyBodHRwczovL2RvY3MubmV0bGlmeS5jb20vY29uZmlndXJlLWJ1aWxkcy9lbnZpcm9ubWVudC12YXJpYWJsZXMvI2RlcGxveS11cmxzLWFuZC1tZXRhZGF0YVxuICAgIG5ldGxpZnk6IGV4dHJhY3QoW1xuICAgICAgXCJCVUlMRF9JRFwiLFxuICAgICAgXCJDT05URVhUXCIsXG4gICAgICBcIlVSTFwiLFxuICAgICAgXCJERVBMT1lfVVJMXCIsXG4gICAgICBcIkRFUExPWV9QUklNRV9VUkxcIixcbiAgICAgIFwiREVQTE9ZX0lEXCIsXG4gICAgXSksXG4gICAgLy8gaHR0cHM6Ly9sYXllcmNpLmNvbS9kb2NzL2xheWVyZmlsZS1yZWZlcmVuY2UvYnVpbGQtZW52XG4gICAgbGF5ZXJjaTogZXh0cmFjdChbXG4gICAgICBcIkxBWUVSQ0lfSk9CX0lEXCIsXG4gICAgICBcIkxBWUVSQ0lfUlVOTkVSX0lEXCIsXG4gICAgICBcIlJFVFJZX0lOREVYXCIsXG4gICAgICBcIkxBWUVSQ0lfUFVMTF9SRVFVRVNUXCIsXG4gICAgICBcIkxBWUVSQ0lfUkVQT19OQU1FXCIsXG4gICAgICBcIkxBWUVSQ0lfUkVQT19PV05FUlwiLFxuICAgICAgXCJMQVlFUkNJX0JSQU5DSFwiLFxuICAgICAgXCJHSVRfVEFHXCIsIC8vIHNob3J0IGhleCBmb3IgY29tbWl0c1xuICAgIF0pLFxuICB9O1xufTtcblxuLy8gdHJpZXMgdG8gZ3JhYiBjb21taXQgaW5mb3JtYXRpb24gZnJvbSBDSSBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbi8vIHZlcnkgdXNlZnVsIHRvIGZpbGwgbWlzc2luZyBpbmZvcm1hdGlvbiB3aGVuIEdpdCBjYW5ub3QgZ3JhYiBjb3JyZWN0IHZhbHVlc1xuY29uc3QgX3Byb3ZpZGVyQ29tbWl0UGFyYW1zID0gKCk6IFByb3ZpZGVyQ29tbWl0UGFyYW1zUmVzID0+IHtcbiAgY29uc3QgeyBlbnYgfSA9IHByb2Nlc3M7XG5cbiAgcmV0dXJuIHtcbiAgICBhcHB2ZXlvcjoge1xuICAgICAgc2hhOiBlbnYuQVBQVkVZT1JfUkVQT19DT01NSVQsXG4gICAgICAvLyBzaW5jZSBBUFBWRVlPUl9SRVBPX0JSQU5DSCB3aWxsIGJlIHRoZSB0YXJnZXQgYnJhbmNoIG9uIGEgUFJcbiAgICAgIC8vIHdlIG5lZWQgdG8gdXNlIFBVTExfUkVRVUVTVF9IRUFEX1JFUE9fQlJBTkNIIGlmIGl0IGV4aXN0cy5cbiAgICAgIC8vIGUuZy4gaWYgeW91IGhhdmUgYSBQUjogZGV2ZWxvcCA8LSBteS1mZWF0dXJlLWJyYW5jaFxuICAgICAgLy8gbXktZmVhdHVyZS1icmFuY2ggaXMgQVBQVkVZT1JfUFVMTF9SRVFVRVNUX0hFQURfUkVQT19CUkFOQ0hcbiAgICAgIC8vIGRldmVsb3AgICAgICAgICAgIGlzIEFQUFZFWU9SX1JFUE9fQlJBTkNIXG4gICAgICBicmFuY2g6XG4gICAgICAgIGVudi5BUFBWRVlPUl9QVUxMX1JFUVVFU1RfSEVBRF9SRVBPX0JSQU5DSCB8fCBlbnYuQVBQVkVZT1JfUkVQT19CUkFOQ0gsXG4gICAgICBtZXNzYWdlOiBqb2luKFxuICAgICAgICBcIlxcblwiLFxuICAgICAgICBlbnYuQVBQVkVZT1JfUkVQT19DT01NSVRfTUVTU0FHRSxcbiAgICAgICAgZW52LkFQUFZFWU9SX1JFUE9fQ09NTUlUX01FU1NBR0VfRVhURU5ERURcbiAgICAgICksXG4gICAgICBhdXRob3JOYW1lOiBlbnYuQVBQVkVZT1JfUkVQT19DT01NSVRfQVVUSE9SLFxuICAgICAgYXV0aG9yRW1haWw6IGVudi5BUFBWRVlPUl9SRVBPX0NPTU1JVF9BVVRIT1JfRU1BSUwsXG4gICAgICAvLyByZW1vdGVPcmlnaW46ID8/P1xuICAgICAgLy8gZGVmYXVsdEJyYW5jaDogPz8/XG4gICAgfSxcbiAgICBhd3NDb2RlQnVpbGQ6IHtcbiAgICAgIHNoYTogZW52LkNPREVCVUlMRF9SRVNPTFZFRF9TT1VSQ0VfVkVSU0lPTixcbiAgICAgIC8vIGJyYW5jaDogPz8/LFxuICAgICAgLy8gbWVzc2FnZTogPz8/XG4gICAgICAvLyBhdXRob3JOYW1lOiA/Pz9cbiAgICAgIC8vIGF1dGhvckVtYWlsOiA/Pz9cbiAgICAgIHJlbW90ZU9yaWdpbjogZW52LkNPREVCVUlMRF9TT1VSQ0VfUkVQT19VUkwsXG4gICAgICAvLyBkZWZhdWx0QnJhbmNoOiA/Pz9cbiAgICB9LFxuICAgIGF6dXJlOiB7XG4gICAgICBzaGE6IGVudi5CVUlMRF9TT1VSQ0VWRVJTSU9OLFxuICAgICAgYnJhbmNoOiBlbnYuQlVJTERfU09VUkNFQlJBTkNITkFNRSxcbiAgICAgIG1lc3NhZ2U6IGVudi5CVUlMRF9TT1VSQ0VWRVJTSU9OTUVTU0FHRSxcbiAgICAgIGF1dGhvck5hbWU6IGVudi5CVUlMRF9TT1VSQ0VWRVJTSU9OQVVUSE9SLFxuICAgICAgYXV0aG9yRW1haWw6IGVudi5CVUlMRF9SRVFVRVNURURGT1JFTUFJTCxcbiAgICB9LFxuICAgIGJhbWJvbzoge1xuICAgICAgc2hhOiBlbnYuYmFtYm9vX3BsYW5SZXBvc2l0b3J5X3JldmlzaW9uLFxuICAgICAgYnJhbmNoOiBlbnYuYmFtYm9vX3BsYW5SZXBvc2l0b3J5X2JyYW5jaCxcbiAgICAgIC8vIG1lc3NhZ2U6ID8/P1xuICAgICAgYXV0aG9yTmFtZTogZW52LmJhbWJvb19wbGFuUmVwb3NpdG9yeV91c2VybmFtZSxcbiAgICAgIC8vIGF1dGhvckVtYWlsOiA/Pz9cbiAgICAgIHJlbW90ZU9yaWdpbjogZW52LmJhbWJvb19wbGFuUmVwb3NpdG9yeV9yZXBvc2l0b3J5VVJMLFxuICAgICAgLy8gZGVmYXVsdEJyYW5jaDogPz8/XG4gICAgfSxcbiAgICBiaXRidWNrZXQ6IHtcbiAgICAgIHNoYTogZW52LkJJVEJVQ0tFVF9DT01NSVQsXG4gICAgICBicmFuY2g6IGVudi5CSVRCVUNLRVRfQlJBTkNILFxuICAgICAgLy8gbWVzc2FnZTogPz8/XG4gICAgICAvLyBhdXRob3JOYW1lOiA/Pz9cbiAgICAgIC8vIGF1dGhvckVtYWlsOiA/Pz9cbiAgICAgIC8vIHJlbW90ZU9yaWdpbjogPz8/XG4gICAgICAvLyBkZWZhdWx0QnJhbmNoOiA/Pz9cbiAgICB9LFxuICAgIGJ1aWxka2l0ZToge1xuICAgICAgc2hhOiBlbnYuQlVJTERLSVRFX0NPTU1JVCxcbiAgICAgIGJyYW5jaDogZW52LkJVSUxES0lURV9CUkFOQ0gsXG4gICAgICBtZXNzYWdlOiBlbnYuQlVJTERLSVRFX01FU1NBR0UsXG4gICAgICBhdXRob3JOYW1lOiBlbnYuQlVJTERLSVRFX0JVSUxEX0NSRUFUT1IsXG4gICAgICBhdXRob3JFbWFpbDogZW52LkJVSUxES0lURV9CVUlMRF9DUkVBVE9SX0VNQUlMLFxuICAgICAgcmVtb3RlT3JpZ2luOiBlbnYuQlVJTERLSVRFX1JFUE8sXG4gICAgICBkZWZhdWx0QnJhbmNoOiBlbnYuQlVJTERLSVRFX1BJUEVMSU5FX0RFRkFVTFRfQlJBTkNILFxuICAgIH0sXG4gICAgY2lyY2xlOiB7XG4gICAgICBzaGE6IGVudi5DSVJDTEVfU0hBMSxcbiAgICAgIGJyYW5jaDogZW52LkNJUkNMRV9CUkFOQ0gsXG4gICAgICAvLyBtZXNzYWdlOiA/Pz9cbiAgICAgIGF1dGhvck5hbWU6IGVudi5DSVJDTEVfVVNFUk5BTUUsXG4gICAgICAvLyBhdXRob3JFbWFpbDogPz8/XG4gICAgICByZW1vdGVPcmlnaW46IGVudi5DSVJDTEVfUkVQT1NJVE9SWV9VUkwsXG4gICAgICAvLyBkZWZhdWx0QnJhbmNoOiA/Pz9cbiAgICB9LFxuICAgIGNvZGVzaGlwQmFzaWM6IHtcbiAgICAgIHNoYTogZW52LkNJX0NPTU1JVF9JRCxcbiAgICAgIGJyYW5jaDogZW52LkNJX0JSQU5DSCxcbiAgICAgIG1lc3NhZ2U6IGVudi5DSV9DT01NSVRfTUVTU0FHRSxcbiAgICAgIGF1dGhvck5hbWU6IGVudi5DSV9DT01NSVRURVJfTkFNRSxcbiAgICAgIGF1dGhvckVtYWlsOiBlbnYuQ0lfQ09NTUlUVEVSX0VNQUlMLFxuICAgICAgLy8gcmVtb3RlT3JpZ2luOiA/Pz9cbiAgICAgIC8vIGRlZmF1bHRCcmFuY2g6ID8/P1xuICAgIH0sXG4gICAgY29kZXNoaXBQcm86IHtcbiAgICAgIHNoYTogZW52LkNJX0NPTU1JVF9JRCxcbiAgICAgIGJyYW5jaDogZW52LkNJX0JSQU5DSCxcbiAgICAgIG1lc3NhZ2U6IGVudi5DSV9DT01NSVRfTUVTU0FHRSxcbiAgICAgIGF1dGhvck5hbWU6IGVudi5DSV9DT01NSVRURVJfTkFNRSxcbiAgICAgIGF1dGhvckVtYWlsOiBlbnYuQ0lfQ09NTUlUVEVSX0VNQUlMLFxuICAgICAgLy8gcmVtb3RlT3JpZ2luOiA/Pz9cbiAgICAgIC8vIGRlZmF1bHRCcmFuY2g6ID8/P1xuICAgIH0sXG4gICAgY29kZUZyZXNoOiB7XG4gICAgICBzaGE6IGVudi5DRl9SRVZJU0lPTixcbiAgICAgIGJyYW5jaDogZW52LkNGX0JSQU5DSCxcbiAgICAgIG1lc3NhZ2U6IGVudi5DRl9DT01NSVRfTUVTU0FHRSxcbiAgICAgIGF1dGhvck5hbWU6IGVudi5DRl9DT01NSVRfQVVUSE9SLFxuICAgIH0sXG4gICAgZHJvbmU6IHtcbiAgICAgIHNoYTogZW52LkRST05FX0NPTU1JVF9TSEEsXG4gICAgICAvLyBodHRwczovL2RvY3MuZHJvbmUuaW8vcGlwZWxpbmUvZW52aXJvbm1lbnQvcmVmZXJlbmNlL2Ryb25lLXNvdXJjZS1icmFuY2gvXG4gICAgICBicmFuY2g6IGVudi5EUk9ORV9TT1VSQ0VfQlJBTkNILFxuICAgICAgbWVzc2FnZTogZW52LkRST05FX0NPTU1JVF9NRVNTQUdFLFxuICAgICAgYXV0aG9yTmFtZTogZW52LkRST05FX0NPTU1JVF9BVVRIT1IsXG4gICAgICBhdXRob3JFbWFpbDogZW52LkRST05FX0NPTU1JVF9BVVRIT1JfRU1BSUwsXG4gICAgICByZW1vdGVPcmlnaW46IGVudi5EUk9ORV9HSVRfSFRUUF9VUkwsXG4gICAgICBkZWZhdWx0QnJhbmNoOiBlbnYuRFJPTkVfUkVQT19CUkFOQ0gsXG4gICAgfSxcbiAgICBnaXRodWJBY3Rpb25zOiB7XG4gICAgICBzaGE6IGVudi5HSVRIVUJfU0hBLFxuICAgICAgYnJhbmNoOiBlbnYuR0hfQlJBTkNIIHx8IGVudi5HSVRIVUJfUkVGLFxuICAgICAgZGVmYXVsdEJyYW5jaDogZW52LkdJVEhVQl9CQVNFX1JFRixcbiAgICAgIHJlbW90ZUJyYW5jaDogZW52LkdJVEhVQl9IRUFEX1JFRixcbiAgICAgIHJ1bkF0dGVtcHQ6IGVudi5HSVRIVUJfUlVOX0FUVEVNUFQsXG4gICAgfSxcbiAgICBnaXRsYWI6IHtcbiAgICAgIHNoYTogZW52LkNJX0NPTU1JVF9TSEEsXG4gICAgICBicmFuY2g6IGVudi5DSV9DT01NSVRfUkVGX05BTUUsXG4gICAgICBtZXNzYWdlOiBlbnYuQ0lfQ09NTUlUX01FU1NBR0UsXG4gICAgICBhdXRob3JOYW1lOiBlbnYuR0lUTEFCX1VTRVJfTkFNRSxcbiAgICAgIGF1dGhvckVtYWlsOiBlbnYuR0lUTEFCX1VTRVJfRU1BSUwsXG4gICAgICByZW1vdGVPcmlnaW46IGVudi5DSV9SRVBPU0lUT1JZX1VSTCxcbiAgICAgIGRlZmF1bHRCcmFuY2g6IGVudi5DSV9ERUZBVUxUX0JSQU5DSCxcbiAgICB9LFxuICAgIGdvb2dsZUNsb3VkOiB7XG4gICAgICBzaGE6IGVudi5DT01NSVRfU0hBLFxuICAgICAgYnJhbmNoOiBlbnYuQlJBTkNIX05BTUUsXG4gICAgICAvLyBtZXNzYWdlOiA/P1xuICAgICAgLy8gYXV0aG9yTmFtZTogPz9cbiAgICAgIC8vIGF1dGhvckVtYWlsOiA/P1xuICAgICAgLy8gcmVtb3RlT3JpZ2luOiA/Pz9cbiAgICAgIC8vIGRlZmF1bHRCcmFuY2g6ID8/XG4gICAgfSxcbiAgICBqZW5raW5zOiB7XG4gICAgICBzaGE6IGVudi5HSVRfQ09NTUlULFxuICAgICAgYnJhbmNoOiBlbnYuR0lUX0JSQU5DSCxcbiAgICAgIC8vIG1lc3NhZ2U6ID8/P1xuICAgICAgLy8gYXV0aG9yTmFtZTogPz8/XG4gICAgICAvLyBhdXRob3JFbWFpbDogPz8/XG4gICAgICAvLyByZW1vdGVPcmlnaW46ID8/P1xuICAgICAgLy8gZGVmYXVsdEJyYW5jaDogPz8/XG4gICAgfSxcbiAgICAvLyBPbmx5IGZyb20gZm9ya3M/IGh0dHBzOi8vc2VtYXBob3JlY2kuY29tL2RvY3MvYXZhaWxhYmxlLWVudmlyb25tZW50LXZhcmlhYmxlcy5odG1sXG4gICAgc2VtYXBob3JlOiB7XG4gICAgICBzaGE6IGVudi5TRU1BUEhPUkVfR0lUX1NIQSxcbiAgICAgIGJyYW5jaDogZW52LlNFTUFQSE9SRV9HSVRfQlJBTkNILFxuICAgICAgLy8gbWVzc2FnZTogPz8/XG4gICAgICAvLyBhdXRob3JOYW1lOiA/Pz9cbiAgICAgIC8vIGF1dGhvckVtYWlsOiA/Pz9cbiAgICAgIHJlbW90ZU9yaWdpbjogZW52LlNFTUFQSE9SRV9HSVRfUkVQT19TTFVHLFxuICAgICAgLy8gZGVmYXVsdEJyYW5jaDogPz8/XG4gICAgfSxcbiAgICBzaGlwcGFibGU6IHtcbiAgICAgIHNoYTogZW52LkNPTU1JVCxcbiAgICAgIGJyYW5jaDogZW52LkJSQU5DSCxcbiAgICAgIG1lc3NhZ2U6IGVudi5DT01NSVRfTUVTU0FHRSxcbiAgICAgIGF1dGhvck5hbWU6IGVudi5DT01NSVRURVIsXG4gICAgICAvLyBhdXRob3JFbWFpbDogPz8/XG4gICAgICAvLyByZW1vdGVPcmlnaW46ID8/P1xuICAgICAgLy8gZGVmYXVsdEJyYW5jaDogPz8/XG4gICAgfSxcbiAgICBzbmFwOiBudWxsLFxuICAgIHRlYW1jaXR5OiBudWxsLFxuICAgIHRlYW1mb3VuZGF0aW9uOiB7XG4gICAgICBzaGE6IGVudi5CVUlMRF9TT1VSQ0VWRVJTSU9OLFxuICAgICAgYnJhbmNoOiBlbnYuQlVJTERfU09VUkNFQlJBTkNITkFNRSxcbiAgICAgIG1lc3NhZ2U6IGVudi5CVUlMRF9TT1VSQ0VWRVJTSU9OTUVTU0FHRSxcbiAgICAgIGF1dGhvck5hbWU6IGVudi5CVUlMRF9TT1VSQ0VWRVJTSU9OQVVUSE9SLFxuICAgIH0sXG4gICAgdHJhdmlzOiB7XG4gICAgICBzaGE6IGVudi5UUkFWSVNfUFVMTF9SRVFVRVNUX1NIQSB8fCBlbnYuVFJBVklTX0NPTU1JVCxcbiAgICAgIC8vIGZvciBQUnMsIFRSQVZJU19CUkFOQ0ggaXMgdGhlIGJhc2UgYnJhbmNoIGJlaW5nIG1lcmdlZCBpbnRvXG4gICAgICBicmFuY2g6IGVudi5UUkFWSVNfUFVMTF9SRVFVRVNUX0JSQU5DSCB8fCBlbnYuVFJBVklTX0JSQU5DSCxcbiAgICAgIC8vIGF1dGhvck5hbWU6ID8/P1xuICAgICAgLy8gYXV0aG9yRW1haWw6ID8/P1xuICAgICAgbWVzc2FnZTogZW52LlRSQVZJU19DT01NSVRfTUVTU0FHRSxcbiAgICAgIC8vIHJlbW90ZU9yaWdpbjogPz8/XG4gICAgICAvLyBkZWZhdWx0QnJhbmNoOiA/Pz9cbiAgICB9LFxuICAgIHdlcmNrZXI6IG51bGwsXG4gICAgbmV0bGlmeToge1xuICAgICAgc2hhOiBlbnYuQ09NTUlUX1JFRixcbiAgICAgIGJyYW5jaDogZW52LkJSQU5DSCxcbiAgICAgIHJlbW90ZU9yaWdpbjogZW52LlJFUE9TSVRPUllfVVJMLFxuICAgIH0sXG4gICAgbGF5ZXJjaToge1xuICAgICAgc2hhOiBlbnYuR0lUX0NPTU1JVCxcbiAgICAgIGJyYW5jaDogZW52LkxBWUVSQ0lfQlJBTkNILFxuICAgICAgbWVzc2FnZTogZW52LkdJVF9DT01NSVRfVElUTEUsXG4gICAgfSxcbiAgfTtcbn07XG5cbnR5cGUgQ2lQcm92aWRlckRhdGEgPSB7XG4gIHNoYT86IHN0cmluZztcbiAgYnJhbmNoPzogc3RyaW5nO1xuICBtZXNzYWdlPzogc3RyaW5nO1xuICBhdXRob3JOYW1lPzogc3RyaW5nO1xuICBhdXRob3JFbWFpbD86IHN0cmluZztcbiAgcmVtb3RlT3JpZ2luPzogc3RyaW5nO1xuICBkZWZhdWx0QnJhbmNoPzogc3RyaW5nO1xuICByZW1vdGVCcmFuY2g/OiBzdHJpbmc7XG4gIHJ1bkF0dGVtcHQ/OiBzdHJpbmc7XG59O1xuXG5pbnRlcmZhY2UgUHJvdmlkZXJDb21taXRQYXJhbXNSZXMge1xuICBba2V5OiBzdHJpbmddOiBDaVByb3ZpZGVyRGF0YSB8IG51bGw7XG59XG5cbmludGVyZmFjZSBQcm92aWRlckNpUGFyYW1zUmVzIHtcbiAgW2tleTogc3RyaW5nXToge1xuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZyB8IHVuZGVmaW5lZDtcbiAgfSB8IG51bGw7XG59XG5cbmNvbnN0IF9nZXQgPSAoZm46ICgpID0+IFByb3ZpZGVyQ29tbWl0UGFyYW1zUmVzIHwgUHJvdmlkZXJDaVBhcmFtc1JlcykgPT4ge1xuICBjb25zdCBwcm92aWRlck5hbWUgPSBnZXRDaVByb3ZpZGVyKCk7XG4gIGlmICghcHJvdmlkZXJOYW1lKSByZXR1cm4ge307XG5cbiAgcmV0dXJuIF8uY2hhaW4oZm4oKSkuZ2V0KHByb3ZpZGVyTmFtZSkudmFsdWUoKTtcbn07XG5cbi8qKlxuICogSWYgdGhlcmUgaXMgbm8gYnVpbGQgSUQgc3BlY2lmaWNhbGx5IHByb3ZpZGVkIGJ5IHVzZXJcbiAqIENoZWNrIGlmIHdlIGNhbiBmZXRjaCBpdCBhdXRvbWF0aWNhbGx5IGZyb20gQ0kgdmFyaWFibGVzLlxuICogVGhlIHByb2Nlc3Mgd2lsbCBzdG9wIGlmIHdlIGNhbm5vdCBkbyBpdFxuICogaHR0cHM6Ly9kb2NzLmN5cHJlc3MuaW8vZ3VpZGVzL3JlZmVyZW5jZXMvZXJyb3ItbWVzc2FnZXMjV2UtY291bGQtbm90LWRldGVybWluZS1hLXVuaXF1ZS1DSS1idWlsZC1JRFxuICovXG5mdW5jdGlvbiBjaGVja0ZvckNpQnVpbGRGcm9tQ2koY2lQcm92aWRlcjogc3RyaW5nIHwgbnVsbCkge1xuICBpZiAoY2lQcm92aWRlciAmJiBkZXRlY3RhYmxlQ2lCdWlsZElkUHJvdmlkZXJzKCkuaW5jbHVkZXMoY2lQcm92aWRlcikpXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgdGhyb3cgbmV3IFZhbGlkYXRpb25FcnJvcihcbiAgICBgQ291bGQgbm90IGRldGVybWluZSBDSSBidWlsZCBJRCBmcm9tIHRoZSBlbnZpcm9ubWVudC4gUGxlYXNlIHByb3ZpZGUgYSB1bmlxdWUgQ0kgYnVpbGQgSUQgdXNpbmcgdGhlIC0tY2ktYnVpbGQtaWQgQ0xJIGZsYWcgb3IgJ2NpQnVpbGRJZCcgcGFyYW1ldGVyIGZvciAncnVuJyBtZXRob2QuYFxuICApO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlzdCgpIHtcbiAgcmV0dXJuIF8ua2V5cyhDSV9QUk9WSURFUlMpO1xufVxuXG4vLyBncmFiIGFsbCBkZXRlY3RhYmxlIHByb3ZpZGVyc1xuLy8gdGhhdCB3ZSBjYW4gZXh0cmFjdCBjaUJ1aWxkSWQgZnJvbVxuZXhwb3J0IGZ1bmN0aW9uIGRldGVjdGFibGVDaUJ1aWxkSWRQcm92aWRlcnMoKSB7XG4gIHJldHVybiBfLmNoYWluKF9wcm92aWRlckNpUGFyYW1zKCkpLm9taXRCeShfLmlzTnVsbCkua2V5cygpLnZhbHVlKCk7XG59XG5cbmV4cG9ydCB0eXBlIENpUHJvdmlkZXIgPSBzdHJpbmcgfCBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2lQcm92aWRlcigpOiBDaVByb3ZpZGVyIHtcbiAgcmV0dXJuIF9kZXRlY3RQcm92aWRlck5hbWUoKSB8fCBudWxsO1xufVxuXG5leHBvcnQgdHlwZSBDaVBhcmFtcyA9IHtcbiAgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldENpUGFyYW1zKCkge1xuICByZXR1cm4gX2dldChfcHJvdmlkZXJDaVBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21taXRQYXJhbXMoKSB7XG4gIHJldHVybiBfZ2V0KF9wcm92aWRlckNvbW1pdFBhcmFtcyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDSShjaUJ1aWxkSWQ/OiBzdHJpbmcpIHtcbiAgY29uc3QgcGFyYW1zID0gZ2V0Q2lQYXJhbXMoKTtcbiAgY29uc3QgcHJvdmlkZXIgPSBnZXRDaVByb3ZpZGVyKCk7XG4gIGlmICghY2lCdWlsZElkKSBjaGVja0ZvckNpQnVpbGRGcm9tQ2kocHJvdmlkZXIpO1xuXG4gIGRlYnVnKFwiZGV0ZWN0ZWQgQ0kgcHJvdmlkZXI6ICVzXCIsIHByb3ZpZGVyKTtcbiAgZGVidWcoXCJkZXRlY3RlZCBDSSBwYXJhbXM6ICVPXCIsIHBhcmFtcyk7XG4gIHJldHVybiB7XG4gICAgcGFyYW1zLFxuICAgIHByb3ZpZGVyLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tbWl0RGVmYXVsdHMoZXhpc3RpbmdJbmZvOiBDaVByb3ZpZGVyRGF0YSkge1xuICBkZWJ1ZyhcImdpdCBjb21taXQgZXhpc3RpbmcgaW5mb1wiKTtcbiAgZGVidWcoZXhpc3RpbmdJbmZvKTtcblxuICBjb25zdCBjb21taXRQYXJhbXNPYmogPSBnZXRDb21taXRQYXJhbXMoKTtcblxuICBkZWJ1ZyhcImNvbW1pdCBpbmZvIGZyb20gcHJvdmlkZXIgZW52aXJvbm1lbnQgdmFyaWFibGVzOiAlT1wiLCBjb21taXRQYXJhbXNPYmopO1xuXG4gIC8vIGJhc2VkIG9uIHRoZSBleGlzdGluZ0luZm8gcHJvcGVydGllc1xuICAvLyBtZXJnZSBpbiB0aGUgY29tbWl0UGFyYW1zIGlmIG51bGwgb3IgdW5kZWZpbmVkXG4gIC8vIGRlZmF1bHRpbmcgYmFjayB0byBudWxsIGlmIGFsbCBmYWlsc1xuICAvLyBOT1RFOiBvbmx5IHByb3BlcnRpZXMgZGVmaW5lZCBpbiBcImV4aXN0aW5nSW5mb1wiIHdpbGwgYmUgcmV0dXJuZWRcbiAgY29uc3QgY29tYmluZWQgPSBfLnRyYW5zZm9ybShcbiAgICBleGlzdGluZ0luZm8sXG4gICAgKFxuICAgICAgbWVtbzogeyBbbWVtb0tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVsbCB9LFxuICAgICAgdmFsdWU6IHN0cmluZyxcbiAgICAgIGtleTogc3RyaW5nXG4gICAgKSA9PiB7XG4gICAgICByZXR1cm4gKG1lbW9ba2V5XSA9IF8uZGVmYXVsdFRvKHZhbHVlIHx8IGNvbW1pdFBhcmFtc09ialtrZXldLCBudWxsKSk7XG4gICAgfVxuICApO1xuXG4gIGRlYnVnKFwiY29tYmluZWQgZ2l0IGFuZCBlbnZpcm9ubWVudCB2YXJpYWJsZXMgZnJvbSBwcm92aWRlclwiKTtcbiAgZGVidWcoY29tYmluZWQpO1xuXG4gIHJldHVybiBjb21iaW5lZDtcbn1cbiIsICJpbXBvcnQgY3lwcmVzcyBmcm9tIFwiY3lwcmVzc1wiO1xuaW1wb3J0IHtcbiAgQ3VycmVudHNSdW5QYXJhbWV0ZXJzLFxuICBWYWxpZGF0ZWRDdXJyZW50c1BhcmFtZXRlcnMsXG59IGZyb20gXCJjeXByZXNzLWNsb3VkL3R5cGVzXCI7XG5pbXBvcnQgRGVidWcgZnJvbSBcImRlYnVnXCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBnZXRDeXByZXNzUnVuQVBJUGFyYW1zIH0gZnJvbSBcIi4uL2NvbmZpZ1wiO1xuaW1wb3J0IHsgQ3lwcmVzc1R5cGVzIH0gZnJvbSBcIi4uL2N5cHJlc3MudHlwZXNcIjtcbmltcG9ydCB7IHNhZmUgfSBmcm9tIFwiLi4vbGFuZ1wiO1xuaW1wb3J0IHsgd2FybiB9IGZyb20gXCIuLi9sb2dcIjtcbmltcG9ydCB7IE1vZHVsZUFQSVJlc3VsdHMgfSBmcm9tIFwiLi4vcmVzdWx0cy9tb2R1bGVBUElSZXN1bHRcIjtcbmltcG9ydCB7IGdldFdTU1BvcnQgfSBmcm9tIFwiLi4vd3NcIjtcblxuY29uc3QgZGVidWcgPSBEZWJ1ZyhcImN1cnJlbnRzOmN5cHJlc3NcIik7XG5pbnRlcmZhY2UgUnVuQ3lwcmVzc1NwZWNGaWxlIHtcbiAgc3BlYzogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuQmFyZUN5cHJlc3MocGFyYW1zOiBDdXJyZW50c1J1blBhcmFtZXRlcnMgPSB7fSkge1xuICAvLyByZXZlcnQgY3VycmVudHMgcGFyYW1zIHRvIGN5cHJlc3MgcGFyYW1zXG4gIC8vIGV4Y2x1ZGUgcmVjb3JkIG1vZGUgcGFyYW1zXG4gIGNvbnN0IHAgPSB7XG4gICAgLi4ucGFyYW1zLFxuICAgIGNpQnVpbGRJZDogdW5kZWZpbmVkLFxuICAgIHRhZzogdW5kZWZpbmVkLFxuICAgIHBhcmFsbGVsOiB1bmRlZmluZWQsXG4gICAgcmVjb3JkOiBmYWxzZSxcbiAgICBncm91cDogdW5kZWZpbmVkLFxuICAgIHNwZWM6IF8uZmxhdHRlbihwYXJhbXMuc3BlYykuam9pbihcIixcIiksXG4gIH07XG4gIGRlYnVnKFwiUnVubmluZyBiYXJlIEN5cHJlc3Mgd2l0aCBwYXJhbXMgJW9cIiwgcCk7XG4gIHJldHVybiBjeXByZXNzLnJ1bihwKTtcbn1cblxuLyoqXG4gKiBSdW4gQ3lwcmVzcyB0ZXN0cywgd2UgbmVlZCB0byBwYXNzIGRvd24gdGhlIHN0cmlwcGVkIG9wdGlvbnMgYXMgaWYgd2UndmUgcmVjZWl2ZWQgdGhlbSBmcm9tIHRoZSBDTElcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blNwZWNGaWxlKFxuICB7IHNwZWMgfTogUnVuQ3lwcmVzc1NwZWNGaWxlLFxuICBjeXByZXNzUnVuT3B0aW9uczogVmFsaWRhdGVkQ3VycmVudHNQYXJhbWV0ZXJzXG4pIHtcbiAgY29uc3QgcnVuQVBJT3B0aW9ucyA9IGdldEN5cHJlc3NSdW5BUElQYXJhbXMoY3lwcmVzc1J1bk9wdGlvbnMpO1xuXG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgLi4ucnVuQVBJT3B0aW9ucyxcbiAgICBjb25maWc6IHtcbiAgICAgIC4uLnJ1bkFQSU9wdGlvbnMuY29uZmlnLFxuICAgICAgdHJhc2hBc3NldHNCZWZvcmVSdW5zOiBmYWxzZSxcbiAgICB9LFxuICAgIGVudjoge1xuICAgICAgLi4ucnVuQVBJT3B0aW9ucy5lbnYsXG4gICAgICBjdXJyZW50c193czogZ2V0V1NTUG9ydCgpLFxuICAgICAgY3VycmVudHNfbWFya2VyOiB0cnVlLFxuICAgIH0sXG4gICAgc3BlYyxcbiAgfTtcbiAgZGVidWcoXCJydW5uaW5nIGN5cHJlc3Mgd2l0aCBvcHRpb25zICVvXCIsIG9wdGlvbnMpO1xuICBjb25zdCByZXN1bHQgPSAoYXdhaXQgY3lwcmVzcy5ydW4ob3B0aW9ucykpIGFzIEN5cHJlc3NUeXBlcy5Nb2R1bGVBUEkuUmVzdWx0O1xuXG4gIGlmIChNb2R1bGVBUElSZXN1bHRzLmlzRmFpbHVyZVJlc3VsdChyZXN1bHQpKSB7XG4gICAgd2FybignQ3lwcmVzcyBydW5uZXIgZmFpbGVkIHdpdGggbWVzc2FnZTogXCIlc1wiJywgcmVzdWx0Lm1lc3NhZ2UpO1xuICAgIHdhcm4oXG4gICAgICBcIlRoZSBmb2xsb3dpbmcgc3BlYyBmaWxlcyB3aWxsIGJlIG1hcmtlZCBhcyBmYWlsZWQ6ICVzXCIsXG4gICAgICBzcGVjXG4gICAgICAgIC5zcGxpdChcIixcIilcbiAgICAgICAgLm1hcCgoaSkgPT4gYFxcbiAtICR7aX1gKVxuICAgICAgICAuam9pbihcIlwiKVxuICAgICk7XG4gIH1cbiAgZGVidWcoXCJjeXByZXNzIHJ1biByZXN1bHQgJW9cIiwgcmVzdWx0KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGNvbnN0IHJ1blNwZWNGaWxlU2FmZSA9IChcbiAgc3BlYzogUnVuQ3lwcmVzc1NwZWNGaWxlLFxuICBjeXByZXNzUnVuT3B0aW9uczogVmFsaWRhdGVkQ3VycmVudHNQYXJhbWV0ZXJzXG4pOiBQcm9taXNlPEN5cHJlc3NUeXBlcy5Nb2R1bGVBUEkuUmVzdWx0PiA9PlxuICBzYWZlKFxuICAgIHJ1blNwZWNGaWxlLFxuICAgIChlcnJvcikgPT4ge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IGBDeXByZXNzIHJ1bm5uZXIgY3Jhc2hlZCB3aXRoIGFuIGVycm9yOlxcbiR7XG4gICAgICAgIChlcnJvciBhcyBFcnJvcikubWVzc2FnZVxuICAgICAgfVxcbiR7KGVycm9yIGFzIEVycm9yKS5zdGFja319YDtcbiAgICAgIGRlYnVnKFwiY3lwcmVzcyBydW4gZXhjZXB0aW9uICVvXCIsIGVycm9yKTtcbiAgICAgIHdhcm4oJ0N5cHJlc3MgcnVubmVyIGNyYXNoZWQ6IFwiJXNcIicsIG1lc3NhZ2UpO1xuICAgICAgd2FybihcbiAgICAgICAgXCJUaGUgZm9sbG93aW5nIHNwZWMgZmlsZXMgd2lsbCBiZSBtYXJrZWQgYXMgZmFpbGVkOiAlc1wiLFxuICAgICAgICBzcGVjLnNwZWNcbiAgICAgICAgICAuc3BsaXQoXCIsXCIpXG4gICAgICAgICAgLm1hcCgoaSkgPT4gYFxcbiAtICR7aX1gKVxuICAgICAgICAgIC5qb2luKFwiXCIpXG4gICAgICApO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzOiBcImZhaWxlZFwiIGFzIGNvbnN0LFxuICAgICAgICBmYWlsdXJlczogMSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgIH07XG4gICAgfSxcbiAgICAoKSA9PiB7fVxuICApKHNwZWMsIGN5cHJlc3NSdW5PcHRpb25zKTtcbiIsICJpbXBvcnQgeyBwYXJzZUlTTyB9IGZyb20gXCJkYXRlLWZuc1wiO1xuaW1wb3J0IHsgTWVyZ2VkQ29uZmlnIH0gZnJvbSBcIi4uL2NvbmZpZ1wiO1xuaW1wb3J0IHsgQ3lwcmVzc1R5cGVzLCBTdGFuZGFyZCB9IGZyb20gXCIuLi9jeXByZXNzLnR5cGVzXCI7XG5pbXBvcnQge1xuICBFeGVjdXRpb25TdGF0ZSxcbiAgRXhlY3V0aW9uU3RhdGVTY3JlZW5zaG90LFxuICBFeGVjdXRpb25TdGF0ZVRlc3RBdHRlbXB0LFxufSBmcm9tIFwiLi4vc3RhdGVcIjtcblxuaW1wb3J0IHsgU3BlY0FmdGVyUmVzdWx0IH0gZnJvbSBcIi4vc3BlY0FmdGVyUmVzdWx0XCI7XG5cbmV4cG9ydCBjbGFzcyBNb2R1bGVBUElSZXN1bHRzIHtcbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0UnVuU2NyZWVuc2hvdHMocnVuOiBDeXByZXNzVHlwZXMuTW9kdWxlQVBJLlJ1bikge1xuICAgIGlmIChcInNjcmVlbnNob3RzXCIgaW4gcnVuKSB7XG4gICAgICByZXR1cm4gcnVuLnNjcmVlbnNob3RzO1xuICAgIH1cbiAgICByZXR1cm4gKHJ1bi50ZXN0cyA/PyBbXSkuZmxhdE1hcCgodCkgPT5cbiAgICAgIHQuYXR0ZW1wdHMuZmxhdE1hcCgoYSkgPT4gYS5zY3JlZW5zaG90cylcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0VGVzdHMoXG4gICAgcnVuOiBDeXByZXNzVHlwZXMuTW9kdWxlQVBJLlJ1bixcbiAgICBleGVjdXRpb25TdGF0ZTogRXhlY3V0aW9uU3RhdGVcbiAgKSB7XG4gICAgY29uc3QgdGVzdHMgPSBydW4udGVzdHMgPz8gW107XG5cbiAgICByZXR1cm4gdGVzdHMubWFwKCh0ZXN0LCBpKSA9PiB7XG4gICAgICBjb25zdCBtb2NoYUF0dGVtcHRzID0gZXhlY3V0aW9uU3RhdGVcbiAgICAgICAgLmdldEF0dGVtcHRzRGF0YSgpXG4gICAgICAgIC5maWx0ZXIoKGF0dGVtcHQpID0+IGF0dGVtcHQuZnVsbFRpdGxlID09PSB0ZXN0LnRpdGxlLmpvaW4oXCIgXCIpKTtcblxuICAgICAgY29uc3QgdGVzdElkID1cbiAgICAgICAgXCJ0ZXN0SWRcIiBpbiB0ZXN0ID8gdGVzdC50ZXN0SWQgOiBtb2NoYUF0dGVtcHRzWzBdPy5pZCA/PyBgciR7aX1gO1xuXG4gICAgICBjb25zdCBydW5TY3JlZW5zaG90UGF0aHMgPSBNb2R1bGVBUElSZXN1bHRzLmdldFJ1blNjcmVlbnNob3RzKHJ1bikubWFwKFxuICAgICAgICAoaSkgPT4gaS5wYXRoXG4gICAgICApO1xuICAgICAgY29uc3QgdGVzdFNjcmVlbnNob3RzID0gZXhlY3V0aW9uU3RhdGVcbiAgICAgICAgLmdldFNjcmVlbnNob3RzRGF0YSgpXG4gICAgICAgIC8vIHNwZWMgc2NyZWVuc2hvdHNcbiAgICAgICAgLmZpbHRlcigocykgPT4gcnVuU2NyZWVuc2hvdFBhdGhzLmluY2x1ZGVzKHMucGF0aCkpXG4gICAgICAgIC8vIHRlc3Qgc2NyZWVuc2hvdHNcbiAgICAgICAgLmZpbHRlcigocykgPT4gcy50ZXN0SWQgPT09IHRlc3RJZCk7XG5cbiAgICAgIGNvbnN0IHN0YW5kYXJkQXR0ZW1wdHMgPSAodGVzdC5hdHRlbXB0cyA/PyBbXSkubWFwKFxuICAgICAgICAoY3lwcmVzc0F0dGVtcHQsIGopID0+IHtcbiAgICAgICAgICBjb25zdCBtb2NoYUF0dGVtcHQgPSBtb2NoYUF0dGVtcHRzLmZpbmQoXG4gICAgICAgICAgICAobWEpID0+IG1hLmN1cnJlbnRSZXRyeSA9PT0galxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3QgYXR0ZW1wdFNjcmVlbnNob3RzID0gdGVzdFNjcmVlbnNob3RzLmZpbHRlcihcbiAgICAgICAgICAgICh0KSA9PiB0LnRlc3RBdHRlbXB0SW5kZXggPT09IGpcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBNb2R1bGVBUElSZXN1bHRzLmdldFRlc3RBdHRlbXB0KFxuICAgICAgICAgICAgbW9jaGFBdHRlbXB0ID8/IG51bGwsXG4gICAgICAgICAgICBjeXByZXNzQXR0ZW1wdCxcbiAgICAgICAgICAgIGF0dGVtcHRTY3JlZW5zaG90cyxcbiAgICAgICAgICAgIC8vIHJ1biBvbmx5IGhhcyAxIHNwZWNcbiAgICAgICAgICAgIFNwZWNBZnRlclJlc3VsdC5nZXRTcGVjU3RhcnRlZEF0KHJ1bi5zdGF0cylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBib2R5OiBcImJvZHlcIiBpbiB0ZXN0ID8gdGVzdC5ib2R5IDogbW9jaGFBdHRlbXB0c1swXT8uYm9keSA/PyBcIlwiLFxuICAgICAgICB0ZXN0SWQsXG4gICAgICAgIHRpdGxlOiB0ZXN0LnRpdGxlLFxuICAgICAgICBkaXNwbGF5RXJyb3I6IHRlc3QuZGlzcGxheUVycm9yLFxuICAgICAgICBzdGF0ZTogdGVzdC5zdGF0ZSxcbiAgICAgICAgYXR0ZW1wdHM6IHN0YW5kYXJkQXR0ZW1wdHMsXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgdmVyc2lvbi1zcGVjaWZpYyBhdHRlbXB0IHRvIGEgc3RhbmRhcmQgdGVzdCBhdHRlbXB0XG4gICAqL1xuICBzdGF0aWMgZ2V0VGVzdEF0dGVtcHQoXG4gICAgbW9jaGFBdHRlbXB0OiBFeGVjdXRpb25TdGF0ZVRlc3RBdHRlbXB0IHwgbnVsbCxcbiAgICBjeXByZXNzQXR0ZW1wdDogQ3lwcmVzc1R5cGVzLk1vZHVsZUFQSS5UZXN0QXR0ZW1wdCxcbiAgICBzY3JlZW5zaG90czogRXhlY3V0aW9uU3RhdGVTY3JlZW5zaG90W10sXG4gICAgc3BlY1N0YXJ0ZWRBdDogRGF0ZVxuICApOiBTdGFuZGFyZC5Nb2R1bGVBUEkuVGVzdEF0dGVtcHQge1xuICAgIGlmICghbW9jaGFBdHRlbXB0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0ZTogY3lwcmVzc0F0dGVtcHQuc3RhdGUsXG4gICAgICAgIGVycm9yOlxuICAgICAgICAgIFwiZXJyb3JcIiBpbiBjeXByZXNzQXR0ZW1wdFxuICAgICAgICAgICAgPyBjeXByZXNzQXR0ZW1wdC5lcnJvclxuICAgICAgICAgICAgOiBTcGVjQWZ0ZXJSZXN1bHQuZ2V0RHVtbXlUZXN0QXR0ZW1wdEVycm9yKGN5cHJlc3NBdHRlbXB0LnN0YXRlKSxcbiAgICAgICAgc3RhcnRlZEF0OlxuICAgICAgICAgIFwic3RhcnRlZEF0XCIgaW4gY3lwcmVzc0F0dGVtcHRcbiAgICAgICAgICAgID8gY3lwcmVzc0F0dGVtcHQuc3RhcnRlZEF0XG4gICAgICAgICAgICA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcblxuICAgICAgICBkdXJhdGlvbjogXCJkdXJhdGlvblwiIGluIGN5cHJlc3NBdHRlbXB0ID8gY3lwcmVzc0F0dGVtcHQuZHVyYXRpb24gOiAwLFxuICAgICAgICB2aWRlb1RpbWVzdGFtcDpcbiAgICAgICAgICBcInZpZGVvVGltZXN0YW1wXCIgaW4gY3lwcmVzc0F0dGVtcHRcbiAgICAgICAgICAgID8gY3lwcmVzc0F0dGVtcHQudmlkZW9UaW1lc3RhbXBcbiAgICAgICAgICAgIDogMCxcbiAgICAgICAgc2NyZWVuc2hvdHM6XG4gICAgICAgICAgXCJzY3JlZW5zaG90c1wiIGluIGN5cHJlc3NBdHRlbXB0XG4gICAgICAgICAgICA/IGN5cHJlc3NBdHRlbXB0LnNjcmVlbnNob3RzXG4gICAgICAgICAgICA6IHNjcmVlbnNob3RzLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdGU6IGN5cHJlc3NBdHRlbXB0LnN0YXRlLFxuICAgICAgZXJyb3I6XG4gICAgICAgIFwiZXJyb3JcIiBpbiBjeXByZXNzQXR0ZW1wdFxuICAgICAgICAgID8gY3lwcmVzc0F0dGVtcHQuZXJyb3JcbiAgICAgICAgICA6IFNwZWNBZnRlclJlc3VsdC5nZXRBdHRlbXB0RXJyb3IobW9jaGFBdHRlbXB0LmVyciksXG5cbiAgICAgIHN0YXJ0ZWRBdDpcbiAgICAgICAgXCJzdGFydGVkQXRcIiBpbiBjeXByZXNzQXR0ZW1wdFxuICAgICAgICAgID8gY3lwcmVzc0F0dGVtcHQuc3RhcnRlZEF0XG4gICAgICAgICAgOiBtb2NoYUF0dGVtcHQud2FsbENsb2NrU3RhcnRlZEF0ID8/IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIGR1cmF0aW9uOlxuICAgICAgICBcImR1cmF0aW9uXCIgaW4gY3lwcmVzc0F0dGVtcHRcbiAgICAgICAgICA/IGN5cHJlc3NBdHRlbXB0LmR1cmF0aW9uXG4gICAgICAgICAgOiBtb2NoYUF0dGVtcHQuZHVyYXRpb24gPz8gLTEsXG4gICAgICB2aWRlb1RpbWVzdGFtcDpcbiAgICAgICAgXCJ2aWRlb1RpbWVzdGFtcFwiIGluIGN5cHJlc3NBdHRlbXB0XG4gICAgICAgICAgPyBjeXByZXNzQXR0ZW1wdC52aWRlb1RpbWVzdGFtcFxuICAgICAgICAgIDogU3BlY0FmdGVyUmVzdWx0LmdldEF0dGVtcHRWaWRlb1RpbWVzdGFtcChcbiAgICAgICAgICAgICAgcGFyc2VJU08obW9jaGFBdHRlbXB0LndhbGxDbG9ja1N0YXJ0ZWRBdCkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICBzcGVjU3RhcnRlZEF0LmdldFRpbWUoKVxuICAgICAgICAgICAgKSxcbiAgICAgIHNjcmVlbnNob3RzOlxuICAgICAgICBcInNjcmVlbnNob3RzXCIgaW4gY3lwcmVzc0F0dGVtcHRcbiAgICAgICAgICA/IGN5cHJlc3NBdHRlbXB0LnNjcmVlbnNob3RzXG4gICAgICAgICAgOiBzY3JlZW5zaG90cyxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGdldFJ1bihcbiAgICBydW46IEN5cHJlc3NUeXBlcy5Nb2R1bGVBUEkuUnVuLFxuICAgIGV4ZWN1dGlvblN0YXRlOiBFeGVjdXRpb25TdGF0ZVxuICApOiBTdGFuZGFyZC5Nb2R1bGVBUEkuUnVuIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ucnVuLFxuICAgICAgdGVzdHM6IE1vZHVsZUFQSVJlc3VsdHMuZ2V0VGVzdHMocnVuLCBleGVjdXRpb25TdGF0ZSksXG4gICAgICBzcGVjOiBTcGVjQWZ0ZXJSZXN1bHQuZ2V0U3BlY1N0YW5kYXJkKHJ1bi5zcGVjKSxcbiAgICAgIC8vIGhvb2tzOiBcImhvb2tzXCIgaW4gcnVuID8gcnVuLmhvb2tzIDogW10sXG4gICAgICBob29rczogbnVsbCxcbiAgICAgIHNob3VsZFVwbG9hZFZpZGVvOlxuICAgICAgICBcInNob3VsZFVwbG9hZFZpZGVvXCIgaW4gcnVuID8gcnVuLnNob3VsZFVwbG9hZFZpZGVvIDogdHJ1ZSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGRpZmZlcmVudCBDeXByZXNzIHZlcnNpb25zIHRvIHN0YW5kYXJkIGZvcm1cbiAgICovXG4gIHN0YXRpYyBnZXRTdGFuZGFyZFJlc3VsdChcbiAgICByZXN1bHQ6IEN5cHJlc3NUeXBlcy5Nb2R1bGVBUEkuQ29tcGxldGVkUmVzdWx0LFxuICAgIGV4ZWN1dGlvblN0YXRlOiBFeGVjdXRpb25TdGF0ZVxuICApOiBTdGFuZGFyZC5Nb2R1bGVBUEkuQ29tcGxldGVkUmVzdWx0IHtcbiAgICBpZiAocmVzdWx0LnJ1bnMubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBzaW5nbGUgcnVuXCIpO1xuICAgIH1cbiAgICBjb25zdCBydW4gPSByZXN1bHQucnVuc1swXTtcbiAgICBjb25zdCBzdGF0cyA9IFNwZWNBZnRlclJlc3VsdC5nZXRTdGF0c1N0YW5kYXJkKHJ1bi5zdGF0cyk7XG5cbiAgICAvLyBzdGFuZGFyZGl6ZSB0aGUgcmVzdWx0IGZvciBzaW5nZSBzcGVjXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnJlc3VsdCxcbiAgICAgIHJ1bnM6IFtNb2R1bGVBUElSZXN1bHRzLmdldFJ1bihydW4sIGV4ZWN1dGlvblN0YXRlKV0sXG4gICAgICB0b3RhbFN1aXRlczogMSxcbiAgICAgIHRvdGFsRHVyYXRpb246IHN0YXRzLndhbGxDbG9ja0R1cmF0aW9uLFxuICAgICAgdG90YWxUZXN0czogc3RhdHMudGVzdHMsXG4gICAgICB0b3RhbEZhaWxlZDogc3RhdHMuZmFpbHVyZXMsXG4gICAgICB0b3RhbFBhc3NlZDogc3RhdHMucGFzc2VzLFxuICAgICAgdG90YWxQZW5kaW5nOiBzdGF0cy5wZW5kaW5nLFxuICAgICAgdG90YWxTa2lwcGVkOiBzdGF0cy5za2lwcGVkLFxuICAgICAgc3RhcnRlZFRlc3RzQXQ6IHN0YXRzLndhbGxDbG9ja1N0YXJ0ZWRBdCxcbiAgICAgIGVuZGVkVGVzdHNBdDogc3RhdHMud2FsbENsb2NrRW5kZWRBdCxcbiAgICAgIHN0YXR1czogXCJmaW5pc2hlZFwiLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgaXNGYWlsdXJlUmVzdWx0KFxuICAgIHJlc3VsdDogQ3lwcmVzc1R5cGVzLk1vZHVsZUFQSS5SZXN1bHRcbiAgKTogcmVzdWx0IGlzIEN5cHJlc3NUeXBlcy5Nb2R1bGVBUEkuRmFpbHVyZVJlc3VsdCB7XG4gICAgcmV0dXJuIFwic3RhdHVzXCIgaW4gcmVzdWx0ICYmIHJlc3VsdC5zdGF0dXMgPT09IFwiZmFpbGVkXCI7XG4gIH1cblxuICBzdGF0aWMgaXNTdWNjZXNzUmVzdWx0ID0gKFxuICAgIHJlc3VsdDogQ3lwcmVzc1R5cGVzLk1vZHVsZUFQSS5SZXN1bHRcbiAgKTogcmVzdWx0IGlzIEN5cHJlc3NUeXBlcy5Nb2R1bGVBUEkuQ29tcGxldGVkUmVzdWx0ID0+IHtcbiAgICBpZiAoXCJzdGF0dXNcIiBpbiByZXN1bHQpIHtcbiAgICAgIHJldHVybiByZXN1bHQuc3RhdHVzID09PSBcImZpbmlzaGVkXCI7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIHN0YXRpYyBnZXRFbXB0eVJlc3VsdChcbiAgICBjb25maWc6IE1lcmdlZENvbmZpZ1xuICApOiBTdGFuZGFyZC5Nb2R1bGVBUEkuQ29tcGxldGVkUmVzdWx0IHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzOiBcImZpbmlzaGVkXCIsXG4gICAgICB0b3RhbER1cmF0aW9uOiAwLFxuICAgICAgdG90YWxTdWl0ZXM6IDAsXG4gICAgICB0b3RhbFBlbmRpbmc6IDAsXG4gICAgICB0b3RhbEZhaWxlZDogMCxcbiAgICAgIHRvdGFsU2tpcHBlZDogMCxcbiAgICAgIHRvdGFsUGFzc2VkOiAwLFxuICAgICAgdG90YWxUZXN0czogMCxcbiAgICAgIHN0YXJ0ZWRUZXN0c0F0OiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICBlbmRlZFRlc3RzQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgIHJ1bnM6IFtdLFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY29uZmlnLFxuICAgIH07XG4gIH1cbn1cbiIsICIvKipcbiAqIFRyYW5zZm9ybXMgY3lwcmVzcyBwYXlsb2FkcyBmcm9tIHZhcmlvdXMgdmVyc2lvbnMgdG8gYSBzaW5nbGUgc3RhbmRhcmRcbiAqL1xuXG5pbXBvcnQgeyBwYXJzZUlTTyB9IGZyb20gXCJkYXRlLWZuc1wiO1xuaW1wb3J0IHsgbWF0Y2ggfSBmcm9tIFwidHMtcGF0dGVyblwiO1xuaW1wb3J0IHsgQ3lwcmVzc1R5cGVzLCBTdGFuZGFyZCB9IGZyb20gXCIuLi9jeXByZXNzLnR5cGVzXCI7XG5pbXBvcnQgeyBNb2NoYUVycm9yIH0gZnJvbSBcIi4uL2N5cHJlc3MudHlwZXMvc2hhcmVkXCI7XG5pbXBvcnQgeyB3YXJuIH0gZnJvbSBcIi4uL2xvZ1wiO1xuaW1wb3J0IHsgZ2V0UmFuZG9tU3RyaW5nIH0gZnJvbSBcIi4uL25hbm9cIjtcbmltcG9ydCB7IEV4ZWN1dGlvblN0YXRlLCBFeGVjdXRpb25TdGF0ZVRlc3RBdHRlbXB0IH0gZnJvbSBcIi4uL3N0YXRlXCI7XG5cbmV4cG9ydCBjbGFzcyBTcGVjQWZ0ZXJSZXN1bHQge1xuICAvKipcbiAgICogQ29tYmluZSBzdGFuZGFsb25lIGF0dGVtcHRzIGFuZCBzY3JlZW5zaG90cyBpbnRvIHN0YW5kYXJkIHJlc3VsdFxuICAgKiBAcGFyYW0gc3BlY1Jlc3VsdCAtIHNwZWM6YWZ0ZXIgcmVzdWx0c1xuICAgKiBAcGFyYW0gZXhlY3V0aW9uU3RhdGUgLSBjY3kgZXhlY3V0aW9uIHN0YXRlXG4gICAqIEByZXR1cm5zIHVuaWZpZWQgcmVzdWx0cywgaW5jbHVkaW5nIGF0dGVtcHRzIGFuZCBzY3JlZW5zaG90IGRldGFpbHNcbiAgICovXG4gIHN0YXRpYyBnZXRTcGVjQWZ0ZXJTdGFuZGFyZChcbiAgICBzcGVjQWZ0ZXJSZXN1bHRzOiBDeXByZXNzVHlwZXMuRXZlbnRQYXlsb2FkLlNwZWNBZnRlci5QYXlsb2FkLFxuICAgIGV4ZWN1dGlvblN0YXRlOiBFeGVjdXRpb25TdGF0ZVxuICApIHtcbiAgICByZXR1cm4ge1xuICAgICAgZXJyb3I6IHNwZWNBZnRlclJlc3VsdHMuZXJyb3IsXG4gICAgICAvLyBob29rczogXCJob29rc1wiIGluIHNwZWNBZnRlclJlc3VsdHMgPyBzcGVjQWZ0ZXJSZXN1bHRzLmhvb2tzIDogbnVsbCxcbiAgICAgIGhvb2tzOiBudWxsLFxuICAgICAgcmVwb3J0ZXI6IHNwZWNBZnRlclJlc3VsdHMucmVwb3J0ZXIsXG4gICAgICByZXBvcnRlclN0YXRzOiBzcGVjQWZ0ZXJSZXN1bHRzLnJlcG9ydGVyU3RhdHMsXG4gICAgICBzcGVjOiBTcGVjQWZ0ZXJSZXN1bHQuZ2V0U3BlY1N0YW5kYXJkKHNwZWNBZnRlclJlc3VsdHMuc3BlYyksXG4gICAgICB0ZXN0czogU3BlY0FmdGVyUmVzdWx0LmdldFRlc3RTdGFuZGFyZChcbiAgICAgICAgc3BlY0FmdGVyUmVzdWx0cyxcbiAgICAgICAgZXhlY3V0aW9uU3RhdGUuZ2V0QXR0ZW1wdHNEYXRhKClcbiAgICAgICksXG4gICAgICB2aWRlbzogc3BlY0FmdGVyUmVzdWx0cy52aWRlbyxcbiAgICAgIHN0YXRzOiBTcGVjQWZ0ZXJSZXN1bHQuZ2V0U3RhdHNTdGFuZGFyZChzcGVjQWZ0ZXJSZXN1bHRzLnN0YXRzKSxcbiAgICAgIHNjcmVlbnNob3RzOiBTcGVjQWZ0ZXJSZXN1bHQuZ2V0U2NyZWVuc2hvdHNTdGFuZGFyZChcbiAgICAgICAgc3BlY0FmdGVyUmVzdWx0cy5zY3JlZW5zaG90cyxcbiAgICAgICAgZXhlY3V0aW9uU3RhdGUuZ2V0U2NyZWVuc2hvdHNEYXRhKClcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRBdHRlbXB0RXJyb3IoZXJyPzogTW9jaGFFcnJvciB8IG51bGwpIHtcbiAgICBpZiAoIWVycikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBlcnIubmFtZSxcbiAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgIGNvZGVGcmFtZTogZXJyLmNvZGVGcmFtZSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGdldEF0dGVtcHRWaWRlb1RpbWVzdGFtcChcbiAgICBhdHRlbXB0U3RhcnRlZEF0TXM6IG51bWJlcixcbiAgICBzcGVjU3RhcnRlZEF0TXM6IG51bWJlclxuICApIHtcbiAgICByZXR1cm4gTWF0aC5tYXgoYXR0ZW1wdFN0YXJ0ZWRBdE1zIC0gc3BlY1N0YXJ0ZWRBdE1zLCAwKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXRTcGVjU3RhcnRlZEF0KFxuICAgIHN0YXRzOiBDeXByZXNzVHlwZXMuRXZlbnRQYXlsb2FkLlNwZWNBZnRlci5QYXlsb2FkW1wic3RhdHNcIl1cbiAgKTogRGF0ZSB7XG4gICAgaWYgKFwic3RhcnRlZEF0XCIgaW4gc3RhdHMpIHtcbiAgICAgIHJldHVybiBwYXJzZUlTTyhzdGF0cy5zdGFydGVkQXQpO1xuICAgIH1cbiAgICBpZiAoXCJ3YWxsQ2xvY2tTdGFydGVkQXRcIiBpbiBzdGF0cykge1xuICAgICAgcmV0dXJuIHBhcnNlSVNPKHN0YXRzLndhbGxDbG9ja1N0YXJ0ZWRBdCk7XG4gICAgfVxuXG4gICAgd2FybihcIkNhbm5vdCBkZXRlcm1pbmUgc3BlYyBzdGFydCBkYXRlIGZyb20gc3RhdHM6ICVvXCIsIHN0YXRzKTtcbiAgICByZXR1cm4gbmV3IERhdGUoKTtcbiAgfVxuXG4gIHN0YXRpYyBnZXREdW1teVRlc3RBdHRlbXB0RXJyb3IoXG4gICAgYXR0ZW1wdFN0YXRlOiBcInBhc3NlZFwiIHwgXCJza2lwcGVkXCIgfCBcInBlbmRpbmdcIiB8IFwiZmFpbGVkXCJcbiAgKSB7XG4gICAgcmV0dXJuIG1hdGNoKGF0dGVtcHRTdGF0ZSlcbiAgICAgIC53aXRoKFwiZmFpbGVkXCIsICgpID0+ICh7XG4gICAgICAgIG5hbWU6IFwiRXJyb3JcIixcbiAgICAgICAgbWVzc2FnZTogXCJbY3lwcmVzcy1jbG91ZF0gQ291bGQgbm90IGdldCBjeXByZXNzIGF0dGVtcHQgZXJyb3IgZGV0YWlsc1wiLFxuICAgICAgICBzdGFjazogXCJcIixcbiAgICAgICAgY29kZUZyYW1lOiBudWxsLFxuICAgICAgfSkpXG4gICAgICAud2l0aChcInNraXBwZWRcIiwgKCkgPT4gKHtcbiAgICAgICAgbmFtZTogXCJFcnJvclwiLFxuICAgICAgICBtZXNzYWdlOiBcIlRoZSB0ZXN0IHdhcyBza2lwcGVkIGJlY2F1c2Ugb2YgYSBob29rIGZhaWx1cmVcIixcbiAgICAgICAgc3RhY2s6IFwiXCIsXG4gICAgICAgIGNvZGVGcmFtZTogbnVsbCxcbiAgICAgIH0pKVxuICAgICAgLm90aGVyd2lzZSgoKSA9PiBudWxsKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIGdldFRlc3RBdHRlbXB0U3RhbmRhcmQoXG4gICAgbW9jaGFBdHRlbXB0OiBFeGVjdXRpb25TdGF0ZVRlc3RBdHRlbXB0IHwgbnVsbCxcbiAgICBjeXByZXNzQXR0ZW1wdDogQ3lwcmVzc1R5cGVzLkV2ZW50UGF5bG9hZC5TcGVjQWZ0ZXIuVGVzdEF0dGVtcHQsXG4gICAgc3BlY1N0YXJ0ZWRBdDogRGF0ZVxuICApOiBTdGFuZGFyZC5TcGVjQWZ0ZXIuVGVzdEF0dGVtcHQge1xuICAgIGlmICghbW9jaGFBdHRlbXB0KSB7XG4gICAgICBjb25zdCBlcnJvciA9IFwiZXJyb3JcIiBpbiBjeXByZXNzQXR0ZW1wdCA/IGN5cHJlc3NBdHRlbXB0LmVycm9yIDogbnVsbDtcbiAgICAgIGNvbnN0IGR1cmF0aW9uID1cbiAgICAgICAgXCJ3YWxsQ2xvY2tEdXJhdGlvblwiIGluIGN5cHJlc3NBdHRlbXB0XG4gICAgICAgICAgPyBjeXByZXNzQXR0ZW1wdC53YWxsQ2xvY2tEdXJhdGlvblxuICAgICAgICAgIDogbnVsbDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXRlOiBjeXByZXNzQXR0ZW1wdC5zdGF0ZSxcbiAgICAgICAgZXJyb3I6IGVycm9yXG4gICAgICAgICAgPyBlcnJvclxuICAgICAgICAgIDogU3BlY0FmdGVyUmVzdWx0LmdldER1bW15VGVzdEF0dGVtcHRFcnJvcihjeXByZXNzQXR0ZW1wdC5zdGF0ZSksXG4gICAgICAgIHRpbWluZ3M6IFwidGltaW5nc1wiIGluIGN5cHJlc3NBdHRlbXB0ID8gY3lwcmVzc0F0dGVtcHQudGltaW5ncyA6IG51bGwsXG4gICAgICAgIHdhbGxDbG9ja1N0YXJ0ZWRBdDpcbiAgICAgICAgICBcIndhbGxDbG9ja1N0YXJ0ZWRBdFwiIGluIGN5cHJlc3NBdHRlbXB0XG4gICAgICAgICAgICA/IGN5cHJlc3NBdHRlbXB0LndhbGxDbG9ja1N0YXJ0ZWRBdFxuICAgICAgICAgICAgOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG5cbiAgICAgICAgd2FsbENsb2NrRHVyYXRpb246IGR1cmF0aW9uID8gZHVyYXRpb24gOiAwLFxuICAgICAgICBmYWlsZWRGcm9tSG9va0lkOlxuICAgICAgICAgIFwiZmFpbGVkRnJvbUhvb2tJZFwiIGluIGN5cHJlc3NBdHRlbXB0XG4gICAgICAgICAgICA/IGN5cHJlc3NBdHRlbXB0LmZhaWxlZEZyb21Ib29rSWRcbiAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgdmlkZW9UaW1lc3RhbXA6XG4gICAgICAgICAgXCJ2aWRlb1RpbWVzdGFtcFwiIGluIGN5cHJlc3NBdHRlbXB0XG4gICAgICAgICAgICA/IGN5cHJlc3NBdHRlbXB0LnZpZGVvVGltZXN0YW1wXG4gICAgICAgICAgICA6IDAsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0ZTogY3lwcmVzc0F0dGVtcHQuc3RhdGUsXG4gICAgICBlcnJvcjpcbiAgICAgICAgXCJlcnJvclwiIGluIGN5cHJlc3NBdHRlbXB0XG4gICAgICAgICAgPyBjeXByZXNzQXR0ZW1wdC5lcnJvclxuICAgICAgICAgIDogU3BlY0FmdGVyUmVzdWx0LmdldEF0dGVtcHRFcnJvcihtb2NoYUF0dGVtcHQuZXJyKSxcbiAgICAgIHRpbWluZ3M6XG4gICAgICAgIFwidGltaW5nc1wiIGluIGN5cHJlc3NBdHRlbXB0XG4gICAgICAgICAgPyBjeXByZXNzQXR0ZW1wdC50aW1pbmdzXG4gICAgICAgICAgOiBtb2NoYUF0dGVtcHQudGltaW5ncyxcbiAgICAgIHdhbGxDbG9ja1N0YXJ0ZWRBdDpcbiAgICAgICAgbW9jaGFBdHRlbXB0LndhbGxDbG9ja1N0YXJ0ZWRBdCA/PyBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXG4gICAgICB3YWxsQ2xvY2tEdXJhdGlvbjogbW9jaGFBdHRlbXB0LmR1cmF0aW9uID8/IC0xLFxuICAgICAgZmFpbGVkRnJvbUhvb2tJZDpcbiAgICAgICAgXCJmYWlsZWRGcm9tSG9va0lkXCIgaW4gY3lwcmVzc0F0dGVtcHRcbiAgICAgICAgICA/IGN5cHJlc3NBdHRlbXB0LmZhaWxlZEZyb21Ib29rSWRcbiAgICAgICAgICA6IG51bGwsXG4gICAgICB2aWRlb1RpbWVzdGFtcDpcbiAgICAgICAgXCJ2aWRlb1RpbWVzdGFtcFwiIGluIGN5cHJlc3NBdHRlbXB0XG4gICAgICAgICAgPyBjeXByZXNzQXR0ZW1wdC52aWRlb1RpbWVzdGFtcFxuICAgICAgICAgIDogU3BlY0FmdGVyUmVzdWx0LmdldEF0dGVtcHRWaWRlb1RpbWVzdGFtcChcbiAgICAgICAgICAgICAgcGFyc2VJU08obW9jaGFBdHRlbXB0LndhbGxDbG9ja1N0YXJ0ZWRBdCkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICBzcGVjU3RhcnRlZEF0LmdldFRpbWUoKVxuICAgICAgICAgICAgKSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0VGVzdFN0YW5kYXJkKFxuICAgIHNwZWNBZnRlclJlc3VsdHM6IEN5cHJlc3NUeXBlcy5FdmVudFBheWxvYWQuU3BlY0FmdGVyLlBheWxvYWQsXG4gICAgYXR0ZW1wdHM6IEV4ZWN1dGlvblN0YXRlW1wiYXR0ZW1wdHNEYXRhXCJdXG4gICkge1xuICAgIGNvbnN0IHN0YW5kYXJkVGVzdExpc3Q6IFN0YW5kYXJkLlNwZWNBZnRlci5QYXlsb2FkW1widGVzdHNcIl0gPSAoXG4gICAgICBzcGVjQWZ0ZXJSZXN1bHRzLnRlc3RzID8/IFtdXG4gICAgKS5tYXAoKHRlc3QsIGkpID0+IHtcbiAgICAgIGNvbnN0IG1vY2hhQXR0ZW1wdHMgPSBhdHRlbXB0cy5maWx0ZXIoXG4gICAgICAgIChhdHRlbXB0KSA9PiBhdHRlbXB0LmZ1bGxUaXRsZSA9PT0gdGVzdC50aXRsZS5qb2luKFwiIFwiKVxuICAgICAgKTtcblxuICAgICAgY29uc3Qgc3RhbmRhcmRBdHRlbXB0cyA9ICh0ZXN0LmF0dGVtcHRzID8/IFtdKS5tYXAoXG4gICAgICAgIChjeXByZXNzQXR0ZW1wdCwgaikgPT4ge1xuICAgICAgICAgIGNvbnN0IG1vY2hhQXR0ZW1wdCA9IG1vY2hhQXR0ZW1wdHMuZmluZChcbiAgICAgICAgICAgIChtYSkgPT4gbWEuY3VycmVudFJldHJ5ID09PSBqXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gU3BlY0FmdGVyUmVzdWx0LmdldFRlc3RBdHRlbXB0U3RhbmRhcmQoXG4gICAgICAgICAgICBtb2NoYUF0dGVtcHQgPz8gbnVsbCxcbiAgICAgICAgICAgIGN5cHJlc3NBdHRlbXB0LFxuICAgICAgICAgICAgU3BlY0FmdGVyUmVzdWx0LmdldFNwZWNTdGFydGVkQXQoc3BlY0FmdGVyUmVzdWx0cy5zdGF0cylcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICApO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBib2R5OiBcImJvZHlcIiBpbiB0ZXN0ID8gdGVzdC5ib2R5IDogbW9jaGFBdHRlbXB0c1swXT8uYm9keSA/PyBcIlwiLFxuICAgICAgICB0ZXN0SWQ6XG4gICAgICAgICAgXCJ0ZXN0SWRcIiBpbiB0ZXN0ID8gdGVzdC50ZXN0SWQgOiBtb2NoYUF0dGVtcHRzWzBdPy5pZCA/PyBgciR7aX1gLFxuICAgICAgICB0aXRsZTogdGVzdC50aXRsZSxcbiAgICAgICAgZGlzcGxheUVycm9yOiB0ZXN0LmRpc3BsYXlFcnJvcixcbiAgICAgICAgc3RhdGU6IHRlc3Quc3RhdGUsXG4gICAgICAgIGF0dGVtcHRzOiBzdGFuZGFyZEF0dGVtcHRzLFxuICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gc3RhbmRhcmRUZXN0TGlzdDtcbiAgfVxuXG4gIHN0YXRpYyBnZXRTcGVjU3RhbmRhcmQoXG4gICAgc3BlYzogQ3lwcmVzc1R5cGVzLkV2ZW50UGF5bG9hZC5TcGVjQWZ0ZXIuU3BlY1xuICApOiBTdGFuZGFyZC5TcGVjQWZ0ZXIuU3BlYyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHNwZWMubmFtZSxcbiAgICAgIHJlbGF0aXZlOiBzcGVjLnJlbGF0aXZlLFxuICAgICAgYWJzb2x1dGU6IHNwZWMuYWJzb2x1dGUsXG4gICAgICBmaWxlRXh0ZW5zaW9uOiBzcGVjLmZpbGVFeHRlbnNpb24sXG4gICAgICBiYXNlTmFtZTogXCJiYXNlTmFtZVwiIGluIHNwZWMgPyBzcGVjLmJhc2VOYW1lIDogXCJcIixcbiAgICAgIGZpbGVOYW1lOiBcImZpbGVOYW1lXCIgaW4gc3BlYyA/IHNwZWMuZmlsZU5hbWUgOiBcIlwiLFxuICAgICAgcmVsYXRpdmVUb0NvbW1vblJvb3Q6XG4gICAgICAgIFwicmVsYXRpdmVUb0NvbW1vblJvb3RcIiBpbiBzcGVjID8gc3BlYy5yZWxhdGl2ZVRvQ29tbW9uUm9vdCA6IFwiXCIsXG4gICAgICBzcGVjRmlsZUV4dGVuc2lvbjpcbiAgICAgICAgXCJzcGVjRmlsZUV4dGVuc2lvblwiIGluIHNwZWMgPyBzcGVjLnNwZWNGaWxlRXh0ZW5zaW9uIDogXCJcIixcbiAgICAgIHNwZWNUeXBlOiBcInNwZWNUeXBlXCIgaW4gc3BlYyA/IHNwZWMuc3BlY1R5cGUgOiBcIlwiLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0U3RhdHNTdGFuZGFyZChcbiAgICBzdGF0czogQ3lwcmVzc1R5cGVzLkV2ZW50UGF5bG9hZC5TcGVjQWZ0ZXIuU3RhdHNcbiAgKTogU3RhbmRhcmQuU3BlY0FmdGVyLlN0YXRzIHtcbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICBza2lwcGVkOiBzdGF0cy5za2lwcGVkLFxuICAgICAgc3VpdGVzOiBzdGF0cy5zdWl0ZXMsXG4gICAgICB0ZXN0czogc3RhdHMudGVzdHMsXG4gICAgICBwYXNzZXM6IHN0YXRzLnBhc3NlcyxcbiAgICAgIHBlbmRpbmc6IHN0YXRzLnBlbmRpbmcsXG4gICAgICBmYWlsdXJlczogc3RhdHMuZmFpbHVyZXMsXG4gICAgICB3YWxsQ2xvY2tTdGFydGVkQXQ6XG4gICAgICAgIFwid2FsbENsb2NrU3RhcnRlZEF0XCIgaW4gc3RhdHNcbiAgICAgICAgICA/IHN0YXRzLndhbGxDbG9ja1N0YXJ0ZWRBdFxuICAgICAgICAgIDogc3RhdHMuc3RhcnRlZEF0LFxuICAgICAgd2FsbENsb2NrRW5kZWRBdDpcbiAgICAgICAgXCJ3YWxsQ2xvY2tFbmRlZEF0XCIgaW4gc3RhdHMgPyBzdGF0cy53YWxsQ2xvY2tFbmRlZEF0IDogc3RhdHMuZW5kZWRBdCxcbiAgICAgIHdhbGxDbG9ja0R1cmF0aW9uOlxuICAgICAgICBcIndhbGxDbG9ja0R1cmF0aW9uXCIgaW4gc3RhdHNcbiAgICAgICAgICA/IHN0YXRzLndhbGxDbG9ja0R1cmF0aW9uXG4gICAgICAgICAgOiBzdGF0cy5kdXJhdGlvbiA/PyAwLFxuICAgIH07XG5cbiAgICAvLyBmaXggd3JvbmcgdG90YWwgZm9yIGNyYXNoZWQgcnVucyAtIGUuZy4gd2hlbiBjeXByZXNzIGZhaWxzIHRvIGNvbXBpbGVcbiAgICByZXN1bHQudGVzdHMgPVxuICAgICAgcmVzdWx0LnBhc3NlcyArIHJlc3VsdC5mYWlsdXJlcyArIHJlc3VsdC5wZW5kaW5nICsgcmVzdWx0LnNraXBwZWQ7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgZ2V0U2NyZWVuc2hvdHNTdGFuZGFyZChcbiAgICBzcGVjQWZ0ZXJTY3JlZW5zaG90czogQ3lwcmVzc1R5cGVzLkV2ZW50UGF5bG9hZC5TcGVjQWZ0ZXIuUGF5bG9hZFtcInNjcmVlbnNob3RzXCJdLFxuICAgIHNjcmVlbnNob3RFdmVudHM6IEV4ZWN1dGlvblN0YXRlW1wic2NyZWVuc2hvdHNEYXRhXCJdXG4gICk6IFN0YW5kYXJkLlNwZWNBZnRlci5QYXlsb2FkW1wic2NyZWVuc2hvdHNcIl0ge1xuICAgIGlmICghc3BlY0FmdGVyU2NyZWVuc2hvdHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgcmV0dXJuIHNwZWNBZnRlclNjcmVlbnNob3RzLm1hcCgoc3BlY1NjcmVlbnNob3QpID0+IHtcbiAgICAgIGNvbnN0IGVzID0gc2NyZWVuc2hvdEV2ZW50cy5maW5kKFxuICAgICAgICAoc2NyZWVuc2hvdCkgPT4gc2NyZWVuc2hvdC5wYXRoID09PSBzcGVjU2NyZWVuc2hvdC5wYXRoXG4gICAgICApO1xuICAgICAgaWYgKCFlcykge1xuICAgICAgICB3YXJuKFxuICAgICAgICAgICdDb3VsZCBub3QgZmluZCBkZXRhaWxzIGZvciBzY3JlZW5zaG90IGF0IHBhdGggXCIlc1wiLCBza2lwcGluZy4uLicsXG4gICAgICAgICAgc3BlY1NjcmVlbnNob3QucGF0aFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaGVpZ2h0OiBzcGVjU2NyZWVuc2hvdC5oZWlnaHQsXG4gICAgICAgIHdpZHRoOiBzcGVjU2NyZWVuc2hvdC53aWR0aCxcbiAgICAgICAgbmFtZTogc3BlY1NjcmVlbnNob3QubmFtZSA/PyBlcz8ubmFtZSA/PyBudWxsLFxuICAgICAgICBwYXRoOiBzcGVjU2NyZWVuc2hvdC5wYXRoLFxuICAgICAgICB0YWtlbkF0OiBzcGVjU2NyZWVuc2hvdC50YWtlbkF0LFxuICAgICAgICB0ZXN0QXR0ZW1wdEluZGV4OlxuICAgICAgICAgIFwidGVzdEF0dGVtcHRJbmRleFwiIGluIHNwZWNTY3JlZW5zaG90XG4gICAgICAgICAgICA/IHNwZWNTY3JlZW5zaG90LnRlc3RBdHRlbXB0SW5kZXhcbiAgICAgICAgICAgIDogZXM/LnRlc3RBdHRlbXB0SW5kZXggPz8gLTEsXG4gICAgICAgIHRlc3RJZDpcbiAgICAgICAgICBcInRlc3RJZFwiIGluIHNwZWNTY3JlZW5zaG90XG4gICAgICAgICAgICA/IHNwZWNTY3JlZW5zaG90LnRlc3RJZFxuICAgICAgICAgICAgOiBlcz8udGVzdElkID8/IFwidW5rbm93blwiLFxuICAgICAgICBzY3JlZW5zaG90SWQ6XG4gICAgICAgICAgXCJzY3JlZW5zaG90SWRcIiBpbiBzcGVjU2NyZWVuc2hvdFxuICAgICAgICAgICAgPyBzcGVjU2NyZWVuc2hvdC5zY3JlZW5zaG90SWRcbiAgICAgICAgICAgIDogZ2V0UmFuZG9tU3RyaW5nKCksXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgZ2V0QVBJQmFzZVVybCB9IGZyb20gXCIuL2h0dHBDbGllbnQvY29uZmlnXCI7XG5cbmV4cG9ydCBjb25zdCBpc0N1cnJlbnRzID0gKCkgPT5cbiAgISFwcm9jZXNzLmVudi5DVVJSRU5UU19FTkZPUkNFX0lTX0NVUlJFTlRTIHx8XG4gIGdldEFQSUJhc2VVcmwoKSA9PT0gXCJodHRwczovL2N5LmN1cnJlbnRzLmRldlwiO1xuIiwgIi8vIEB0cy1pZ25vcmVcbmltcG9ydCBnaXQgZnJvbSBcIkBjeXByZXNzL2NvbW1pdC1pbmZvXCI7XG5pbXBvcnQgeyBnZXRDb21taXREZWZhdWx0cyB9IGZyb20gXCIuL2NpUHJvdmlkZXJcIjtcblxuZXhwb3J0IGNvbnN0IGdldEdpdEluZm8gPSBhc3luYyAocHJvamVjdFJvb3Q6IHN0cmluZykgPT4ge1xuICBjb25zdCBjb21taXRJbmZvID0gYXdhaXQgZ2l0LmNvbW1pdEluZm8ocHJvamVjdFJvb3QpO1xuICByZXR1cm4gZ2V0Q29tbWl0RGVmYXVsdHMoe1xuICAgIGJyYW5jaDogY29tbWl0SW5mby5icmFuY2gsXG4gICAgcmVtb3RlT3JpZ2luOiBjb21taXRJbmZvLnJlbW90ZSxcbiAgICBhdXRob3JFbWFpbDogY29tbWl0SW5mby5lbWFpbCxcbiAgICBhdXRob3JOYW1lOiBjb21taXRJbmZvLmF1dGhvcixcbiAgICBtZXNzYWdlOiBjb21taXRJbmZvLm1lc3NhZ2UsXG4gICAgc2hhOiBjb21taXRJbmZvLnNoYSxcbiAgfSk7XG59O1xuIiwgImltcG9ydCBEZWJ1ZyBmcm9tIFwiZGVidWdcIjtcblxuaW1wb3J0IHsgQ3lwcmVzc1R5cGVzIH0gZnJvbSBcIi4vY3lwcmVzcy50eXBlc1wiO1xuaW1wb3J0IHsgRXZlbnQsIGFsbEV2ZW50cywgZ2V0UHViU3ViIH0gZnJvbSBcIi4vcHVic3ViXCI7XG5pbXBvcnQge1xuICBoYW5kbGVTY3JlZW5zaG90RXZlbnQsXG4gIGhhbmRsZVNwZWNBZnRlcixcbiAgaGFuZGxlVGVzdEFmdGVyLFxuICBoYW5kbGVUZXN0QmVmb3JlLFxufSBmcm9tIFwiLi9yZXN1bHRzL2NhcHR1cmVIb29rc1wiO1xuaW1wb3J0IHsgTW9kdWxlQVBJUmVzdWx0cyB9IGZyb20gXCIuL3Jlc3VsdHMvbW9kdWxlQVBJUmVzdWx0XCI7XG5pbXBvcnQgeyBDb25maWdTdGF0ZSwgRXhlY3V0aW9uU3RhdGUgfSBmcm9tIFwiLi9zdGF0ZVwiO1xuXG5jb25zdCBkZWJ1ZyA9IERlYnVnKFwiY3VycmVudHM6ZXZlbnRzXCIpO1xuXG5leHBvcnQgZnVuY3Rpb24gc3RvcExpc3RlbmluZ1RvRXZlbnRzKCkge1xuICBhbGxFdmVudHMuZm9yRWFjaCgoZSkgPT4gZ2V0UHViU3ViKCkucmVtb3ZlQWxsTGlzdGVuZXJzKGUpKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBsaXN0ZW5Ub0V2ZW50cyhcbiAgY29uZmlnU3RhdGU6IENvbmZpZ1N0YXRlLFxuICBleGVjdXRpb25TdGF0ZTogRXhlY3V0aW9uU3RhdGUsXG4gIGV4cGVyaW1lbnRhbENvdmVyYWdlUmVjb3JkaW5nOiBib29sZWFuID0gZmFsc2Vcbikge1xuICBnZXRQdWJTdWIoKS5vbihcbiAgICBFdmVudC5SVU5fUkVTVUxULFxuICAgICh7XG4gICAgICBpbnN0YW5jZUlkLFxuICAgICAgcnVuUmVzdWx0LFxuICAgICAgc3BlY1JlbGF0aXZlLFxuICAgIH06IHtcbiAgICAgIHNwZWNSZWxhdGl2ZTogc3RyaW5nO1xuICAgICAgaW5zdGFuY2VJZDogc3RyaW5nO1xuICAgICAgcnVuUmVzdWx0OiBDeXByZXNzVHlwZXMuTW9kdWxlQVBJLkNvbXBsZXRlZFJlc3VsdDtcbiAgICB9KSA9PiB7XG4gICAgICAvLyAlIHNhdmUgcmVzdWx0c1xuICAgICAgLy8gd3JpdGVEYXRhVG9GaWxlKFxuICAgICAgLy8gICBKU09OLnN0cmluZ2lmeShydW5SZXN1bHQpLFxuICAgICAgLy8gICBnZXRTcGVjU2hvcnROYW1lKHNwZWNSZWxhdGl2ZSksXG4gICAgICAvLyAgIFwicnVuUmVzdWx0XCJcbiAgICAgIC8vICk7XG4gICAgICBkZWJ1ZyhcIiVzICVzOiAlb1wiLCBFdmVudC5SVU5fUkVTVUxULCBpbnN0YW5jZUlkLCBydW5SZXN1bHQpO1xuICAgICAgZXhlY3V0aW9uU3RhdGUuc2V0SW5zdGFuY2VSZXN1bHQoXG4gICAgICAgIGluc3RhbmNlSWQsXG4gICAgICAgIE1vZHVsZUFQSVJlc3VsdHMuZ2V0U3RhbmRhcmRSZXN1bHQocnVuUmVzdWx0LCBleGVjdXRpb25TdGF0ZSlcbiAgICAgICk7XG4gICAgfVxuICApO1xuXG4gIGdldFB1YlN1YigpLm9uKEV2ZW50LlRFU1RfQUZURVJfUlVOLCAocGF5bG9hZDogc3RyaW5nKSA9PiB7XG4gICAgZGVidWcoXCIlcyAlb1wiLCBFdmVudC5URVNUX0FGVEVSX1JVTiwgcGF5bG9hZCk7XG4gICAgaGFuZGxlVGVzdEFmdGVyKHBheWxvYWQsIGV4ZWN1dGlvblN0YXRlKTtcbiAgfSk7XG5cbiAgZ2V0UHViU3ViKCkub24oRXZlbnQuVEVTVF9CRUZPUkVfUlVOLCAocGF5bG9hZDogc3RyaW5nKSA9PiB7XG4gICAgZGVidWcoXCIlcyAlb1wiLCBFdmVudC5URVNUX0JFRk9SRV9SVU4sIHBheWxvYWQpO1xuICAgIGhhbmRsZVRlc3RCZWZvcmUocGF5bG9hZCwgZXhlY3V0aW9uU3RhdGUpO1xuICB9KTtcblxuICBnZXRQdWJTdWIoKS5vbihcbiAgICBFdmVudC5BRlRFUl9TQ1JFRU5TSE9ULFxuICAgIChzY3JlZW5zaG90OiBDeXByZXNzVHlwZXMuRXZlbnRQYXlsb2FkLlNjcmVlbnNob3RBZnRlcikgPT4ge1xuICAgICAgZGVidWcoXCIlcyAlb1wiLCBFdmVudC5BRlRFUl9TQ1JFRU5TSE9ULCBzY3JlZW5zaG90KTtcbiAgICAgIGhhbmRsZVNjcmVlbnNob3RFdmVudChzY3JlZW5zaG90LCBleGVjdXRpb25TdGF0ZSk7XG4gICAgfVxuICApO1xuXG4gIGdldFB1YlN1YigpLm9uKFxuICAgIEV2ZW50LkFGVEVSX1NQRUMsXG4gICAgYXN5bmMgKHtcbiAgICAgIHNwZWMsXG4gICAgICByZXN1bHRzLFxuICAgIH06IHtcbiAgICAgIHNwZWM6IEN5cHJlc3NUeXBlcy5FdmVudFBheWxvYWQuU3BlY0FmdGVyLlNwZWM7XG4gICAgICByZXN1bHRzOiBDeXByZXNzVHlwZXMuRXZlbnRQYXlsb2FkLlNwZWNBZnRlci5QYXlsb2FkO1xuICAgIH0pID0+IHtcbiAgICAgIGF3YWl0IGhhbmRsZVNwZWNBZnRlcih7XG4gICAgICAgIHNwZWMsXG4gICAgICAgIHJlc3VsdHMsXG4gICAgICAgIGV4ZWN1dGlvblN0YXRlLFxuICAgICAgICBjb25maWdTdGF0ZSxcbiAgICAgICAgZXhwZXJpbWVudGFsQ292ZXJhZ2VSZWNvcmRpbmcsXG4gICAgICB9KTtcbiAgICB9XG4gICk7XG59XG4iLCAiaW1wb3J0IERlYnVnIGZyb20gXCJkZWJ1Z1wiO1xuaW1wb3J0IHsgZ2V0Q2FwdHVyZWRPdXRwdXQgfSBmcm9tIFwiLi4vY2FwdHVyZVwiO1xuaW1wb3J0IHsgZ2V0Q292ZXJhZ2VGaWxlUGF0aCB9IGZyb20gXCIuLi9jb3ZlcmFnZVwiO1xuaW1wb3J0IHsgQ3lwcmVzc1R5cGVzIH0gZnJvbSBcIi4uL2N5cHJlc3MudHlwZXNcIjtcbmltcG9ydCB7IGRpbSB9IGZyb20gXCIuLi9sb2dcIjtcbmltcG9ydCB7IGNyZWF0ZVJlcG9ydFRhc2tTcGVjIH0gZnJvbSBcIi4uL3J1bm5lclwiO1xuaW1wb3J0IHsgQ29uZmlnU3RhdGUsIEV4ZWN1dGlvblN0YXRlIH0gZnJvbSBcIi4uL3N0YXRlXCI7XG5pbXBvcnQgeyBTcGVjQWZ0ZXJSZXN1bHQgfSBmcm9tIFwiLi9zcGVjQWZ0ZXJSZXN1bHRcIjtcblxuY29uc3QgZGVidWcgPSBEZWJ1ZyhcImN1cnJlbnRzOmV2ZW50c1wiKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZVNjcmVlbnNob3RFdmVudChcbiAgc2NyZWVuc2hvdDogQ3lwcmVzc1R5cGVzLkV2ZW50UGF5bG9hZC5TY3JlZW5zaG90QWZ0ZXIsXG4gIGV4ZWN1dGlvblN0YXRlOiBFeGVjdXRpb25TdGF0ZVxuKSB7XG4gIGNvbnN0IGRhdGEgPSB7XG4gICAgLi4uc2NyZWVuc2hvdCxcbiAgICB0ZXN0SWQ6IGV4ZWN1dGlvblN0YXRlLmdldEN1cnJlbnRUZXN0SUQoKSxcbiAgICBoZWlnaHQ6IHNjcmVlbnNob3QuZGltZW5zaW9ucy5oZWlnaHQsXG4gICAgd2lkdGg6IHNjcmVlbnNob3QuZGltZW5zaW9ucy53aWR0aCxcbiAgfTtcblxuICAvLyAlIHNhdmUgcmVzdWx0c1xuICAvLyAgIHdyaXRlRGF0YVRvRmlsZShcbiAgLy8gICAgIEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAvLyAgICAgYCR7c2NyZWVuc2hvdC5zcGVjTmFtZX1gLFxuICAvLyAgICAgYHNjcmVlbnNob3RgLFxuICAvLyAgICAgYF8wJHtnZXRTY3JlZW5zaG90Q291bnQoc2NyZWVuc2hvdC5zcGVjTmFtZSl9YFxuICAvLyAgICk7XG5cbiAgZXhlY3V0aW9uU3RhdGUuYWRkU2NyZWVuc2hvdHNEYXRhKGRhdGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlVGVzdEJlZm9yZShcbiAgdGVzdEF0dGVtcHQ6IHN0cmluZyxcbiAgZXhlY3V0aW9uU3RhdGU6IEV4ZWN1dGlvblN0YXRlXG4pIHtcbiAgY29uc3QgcGFyc2VkOiBDeXByZXNzVHlwZXMuRXZlbnRQYXlsb2FkLlRlc3RCZWZvcmUgPSBKU09OLnBhcnNlKHRlc3RBdHRlbXB0KTtcbiAgZXhlY3V0aW9uU3RhdGUuc2V0Q3VycmVudFRlc3RJRChwYXJzZWQuaWQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlVGVzdEFmdGVyKFxuICB0ZXN0QXR0ZW1wdDogc3RyaW5nLFxuICBleGVjdXRpb25TdGF0ZTogRXhlY3V0aW9uU3RhdGVcbikge1xuICBjb25zdCB0ZXN0OiBDeXByZXNzVHlwZXMuRXZlbnRQYXlsb2FkLlRlc3RBZnRlciA9IEpTT04ucGFyc2UodGVzdEF0dGVtcHQpO1xuXG4gIC8vICUgc2F2ZSByZXN1bHRzXG4gIC8vICAgd3JpdGVEYXRhVG9GaWxlKFxuICAvLyAgICAgdGVzdEF0dGVtcHQsXG4gIC8vICAgICBnZXRUZXN0SG9va1NwZWNOYW1lKHRlc3QpLFxuICAvLyAgICAgXCJ0ZXN0QWZ0ZXJcIixcbiAgLy8gICAgIGBfMCR7dGVzdC5jdXJyZW50UmV0cnl9YFxuICAvLyAgICk7XG5cbiAgZXhlY3V0aW9uU3RhdGUuYWRkQXR0ZW1wdHNEYXRhKHRlc3QpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3BlY0FmdGVyKHtcbiAgZXhlY3V0aW9uU3RhdGUsXG4gIGNvbmZpZ1N0YXRlLFxuICBzcGVjLFxuICByZXN1bHRzLFxuICBleHBlcmltZW50YWxDb3ZlcmFnZVJlY29yZGluZyA9IGZhbHNlLFxufToge1xuICBleGVjdXRpb25TdGF0ZTogRXhlY3V0aW9uU3RhdGU7XG4gIGNvbmZpZ1N0YXRlOiBDb25maWdTdGF0ZTtcbiAgc3BlYzogQ3lwcmVzc1R5cGVzLkV2ZW50UGF5bG9hZC5TcGVjQWZ0ZXIuU3BlYztcbiAgcmVzdWx0czogQ3lwcmVzc1R5cGVzLkV2ZW50UGF5bG9hZC5TcGVjQWZ0ZXIuUGF5bG9hZDtcbiAgZXhwZXJpbWVudGFsQ292ZXJhZ2VSZWNvcmRpbmc6IGJvb2xlYW47XG59KSB7XG4gIC8vICUgc2F2ZSByZXN1bHRzXG4gIC8vICAgY29uc3QgcyA9IGdldFNwZWNTaG9ydE5hbWUoc3BlYy5yZWxhdGl2ZSk7XG4gIC8vICAgd3JpdGVEYXRhVG9GaWxlKEpTT04uc3RyaW5naWZ5KHJlc3VsdHMpLCBzLCBcInNwZWNBZnRlclwiKTtcblxuICBkZWJ1ZyhcImFmdGVyOnNwZWMgJXMgJW9cIiwgc3BlYy5yZWxhdGl2ZSwgcmVzdWx0cyk7XG4gIGV4ZWN1dGlvblN0YXRlLnNldFNwZWNBZnRlcihcbiAgICBzcGVjLnJlbGF0aXZlLFxuICAgIFNwZWNBZnRlclJlc3VsdC5nZXRTcGVjQWZ0ZXJTdGFuZGFyZChyZXN1bHRzLCBleGVjdXRpb25TdGF0ZSlcbiAgKTtcbiAgZXhlY3V0aW9uU3RhdGUuc2V0U3BlY091dHB1dChzcGVjLnJlbGF0aXZlLCBnZXRDYXB0dXJlZE91dHB1dCgpKTtcbiAgY29uc3QgY29uZmlnID0gY29uZmlnU3RhdGUuZ2V0Q29uZmlnKCk7XG5cbiAgaWYgKGV4cGVyaW1lbnRhbENvdmVyYWdlUmVjb3JkaW5nKSB7XG4gICAgY29uc3QgY29uZmlnID0gY29uZmlnU3RhdGUuZ2V0Q29uZmlnKCk7XG5cbiAgICBjb25zdCB7IHBhdGgsIGVycm9yIH0gPSBhd2FpdCBnZXRDb3ZlcmFnZUZpbGVQYXRoKFxuICAgICAgY29uZmlnPy5lbnY/LmNvdmVyYWdlRmlsZVxuICAgICk7XG5cbiAgICBpZiAoIWVycm9yKSB7XG4gICAgICBleGVjdXRpb25TdGF0ZS5zZXRTcGVjQ292ZXJhZ2Uoc3BlYy5yZWxhdGl2ZSwgcGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4ZWN1dGlvblN0YXRlLmFkZFdhcm5pbmcoXG4gICAgICAgIGBFcnJvciByZWFkaW5nIGNvdmVyYWdlIGZpbGUgXCIke3BhdGh9XCIuIENvdmVyYWdlIHJlY29yZGluZyB3aWxsIGJlIHNraXBwZWQuXFxuJHtkaW0oXG4gICAgICAgICAgZXJyb3JcbiAgICAgICAgKX1gXG4gICAgICApO1xuICAgIH1cbiAgfVxuICBjcmVhdGVSZXBvcnRUYXNrU3BlYyhjb25maWdTdGF0ZSwgZXhlY3V0aW9uU3RhdGUsIHNwZWMucmVsYXRpdmUpO1xufVxuIiwgImltcG9ydCBmcyBmcm9tIFwiZnMvcHJvbWlzZXNcIjtcbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwicGF0aFwiO1xuXG5leHBvcnQgY29uc3QgZ2V0Q292ZXJhZ2VGaWxlUGF0aCA9IGFzeW5jIChcbiAgY292ZXJhZ2VGaWxlID0gXCIuLy5ueWNfb3V0cHV0L291dC5qc29uXCJcbikgPT4ge1xuICBjb25zdCBwYXRoID0gam9pbihwcm9jZXNzLmN3ZCgpLCBjb3ZlcmFnZUZpbGUpO1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgZnMuYWNjZXNzKHBhdGgpO1xuICAgIHJldHVybiB7XG4gICAgICBwYXRoLFxuICAgICAgZXJyb3I6IGZhbHNlLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhdGgsXG4gICAgICBlcnJvcixcbiAgICB9O1xuICB9XG59O1xuIiwgImltcG9ydCB7XG4gIFNwZWNXaXRoUmVsYXRpdmVSb290LFxuICBWYWxpZGF0ZWRDdXJyZW50c1BhcmFtZXRlcnMsXG59IGZyb20gXCJjeXByZXNzLWNsb3VkL3R5cGVzXCI7XG5pbXBvcnQgeyBnZXRDYXB0dXJlZE91dHB1dCwgcmVzZXRDYXB0dXJlIH0gZnJvbSBcIi4uL2NhcHR1cmVcIjtcblxuaW1wb3J0IHsgTW9kdWxlQVBJUmVzdWx0cyB9IGZyb20gXCIuLi9yZXN1bHRzL21vZHVsZUFQSVJlc3VsdFwiO1xuXG5pbXBvcnQgRGVidWcgZnJvbSBcImRlYnVnXCI7XG5pbXBvcnQge1xuICBJbnN0YW5jZUFQSVBheWxvYWQsXG4gIGNyZWF0ZUJhdGNoZWRJbnN0YW5jZXMsXG4gIGNyZWF0ZUluc3RhbmNlLFxufSBmcm9tIFwiLi4vYXBpXCI7XG5cbmltcG9ydCB7IHJ1blNwZWNGaWxlU2FmZSB9IGZyb20gXCIuLi9jeXByZXNzXCI7XG5pbXBvcnQgeyBDeXByZXNzVHlwZXMgfSBmcm9tIFwiLi4vY3lwcmVzcy50eXBlc1wiO1xuaW1wb3J0IHsgaXNDdXJyZW50cyB9IGZyb20gXCIuLi9lbnZcIjtcbmltcG9ydCB7IGRpdmlkZXIsIGluZm8sIHRpdGxlLCB3YXJuIH0gZnJvbSBcIi4uL2xvZ1wiO1xuaW1wb3J0IHsgRXZlbnQsIGdldFB1YlN1YiB9IGZyb20gXCIuLi9wdWJzdWJcIjtcbmltcG9ydCB7IENvbmZpZ1N0YXRlLCBFeGVjdXRpb25TdGF0ZSB9IGZyb20gXCIuLi9zdGF0ZVwiO1xuaW1wb3J0IHsgY3JlYXRlUmVwb3J0VGFzaywgcmVwb3J0VGFza3MgfSBmcm9tIFwiLi9yZXBvcnRUYXNrXCI7XG5cbmNvbnN0IGRlYnVnID0gRGVidWcoXCJjdXJyZW50czpydW5uZXJcIik7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5UaWxsRG9uZShcbiAgZXhlY3V0aW9uU3RhdGU6IEV4ZWN1dGlvblN0YXRlLFxuICBjb25maWdTdGF0ZTogQ29uZmlnU3RhdGUsXG4gIHtcbiAgICBydW5JZCxcbiAgICBncm91cElkLFxuICAgIG1hY2hpbmVJZCxcbiAgICBwbGF0Zm9ybSxcbiAgICBzcGVjczogYWxsU3BlY3MsXG4gIH06IEluc3RhbmNlQVBJUGF5bG9hZC5DcmVhdGVJbnN0YW5jZVBheWxvYWQgJiB7XG4gICAgc3BlY3M6IFNwZWNXaXRoUmVsYXRpdmVSb290W107XG4gIH0sXG4gIHBhcmFtczogVmFsaWRhdGVkQ3VycmVudHNQYXJhbWV0ZXJzXG4pIHtcbiAgbGV0IGhhc01vcmUgPSB0cnVlO1xuXG4gIHdoaWxlIChoYXNNb3JlKSB7XG4gICAgY29uc3QgbmV3VGFza3MgPSBhd2FpdCBydW5CYXRjaChleGVjdXRpb25TdGF0ZSwgY29uZmlnU3RhdGUsIHtcbiAgICAgIHJ1bk1ldGE6IHtcbiAgICAgICAgcnVuSWQsXG4gICAgICAgIGdyb3VwSWQsXG4gICAgICAgIG1hY2hpbmVJZCxcbiAgICAgICAgcGxhdGZvcm0sXG4gICAgICB9LFxuICAgICAgYWxsU3BlY3MsXG4gICAgICBwYXJhbXMsXG4gICAgfSk7XG4gICAgaWYgKCFuZXdUYXNrcy5sZW5ndGgpIHtcbiAgICAgIGRlYnVnKFwiTm8gbW9yZSB0YXNrcyB0byBydW4uIFVwbG9hZHMgcXVldWU6ICVkXCIsIHJlcG9ydFRhc2tzLmxlbmd0aCk7XG4gICAgICBoYXNNb3JlID0gZmFsc2U7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgbmV3VGFza3MuZm9yRWFjaCgodCkgPT5cbiAgICAgIGNyZWF0ZVJlcG9ydFRhc2soY29uZmlnU3RhdGUsIGV4ZWN1dGlvblN0YXRlLCB0Lmluc3RhbmNlSWQpXG4gICAgKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBydW5CYXRjaChcbiAgZXhlY3V0aW9uU3RhdGU6IEV4ZWN1dGlvblN0YXRlLFxuICBjb25maWdTdGF0ZTogQ29uZmlnU3RhdGUsXG4gIHtcbiAgICBydW5NZXRhLFxuICAgIHBhcmFtcyxcbiAgICBhbGxTcGVjcyxcbiAgfToge1xuICAgIHJ1bk1ldGE6IHtcbiAgICAgIHJ1bklkOiBzdHJpbmc7XG4gICAgICBncm91cElkOiBzdHJpbmc7XG4gICAgICBtYWNoaW5lSWQ6IHN0cmluZztcbiAgICAgIHBsYXRmb3JtOiBJbnN0YW5jZUFQSVBheWxvYWQuQ3JlYXRlSW5zdGFuY2VQYXlsb2FkW1wicGxhdGZvcm1cIl07XG4gICAgfTtcbiAgICBhbGxTcGVjczogU3BlY1dpdGhSZWxhdGl2ZVJvb3RbXTtcbiAgICBwYXJhbXM6IFZhbGlkYXRlZEN1cnJlbnRzUGFyYW1ldGVycztcbiAgfVxuKSB7XG4gIGxldCBiYXRjaCA9IHtcbiAgICBzcGVjczogW10gYXMgSW5zdGFuY2VBUElQYXlsb2FkLkluc3RhbmNlUmVzcG9uc2VTcGVjRGV0YWlsc1tdLFxuICAgIGNsYWltZWRJbnN0YW5jZXM6IDAsXG4gICAgdG90YWxJbnN0YW5jZXM6IDAsXG4gIH07XG5cbiAgaWYgKGlzQ3VycmVudHMoKSkge1xuICAgIGRlYnVnKFwiR2V0dGluZyBiYXRjaGVkIHRhc2tzOiAlZFwiLCBwYXJhbXMuYmF0Y2hTaXplKTtcbiAgICBiYXRjaCA9IGF3YWl0IGNyZWF0ZUJhdGNoZWRJbnN0YW5jZXMoe1xuICAgICAgLi4ucnVuTWV0YSxcbiAgICAgIGJhdGNoU2l6ZTogcGFyYW1zLmJhdGNoU2l6ZSxcbiAgICB9KTtcbiAgICBkZWJ1ZyhcIkdvdCBiYXRjaGVkIHRhc2tzOiAlb1wiLCBiYXRjaCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBjcmVhdGVJbnN0YW5jZShydW5NZXRhKTtcblxuICAgIGlmIChyZXNwb25zZS5zcGVjICE9PSBudWxsICYmIHJlc3BvbnNlLmluc3RhbmNlSWQgIT09IG51bGwpIHtcbiAgICAgIGJhdGNoLnNwZWNzLnB1c2goe1xuICAgICAgICBzcGVjOiByZXNwb25zZS5zcGVjLFxuICAgICAgICBpbnN0YW5jZUlkOiByZXNwb25zZS5pbnN0YW5jZUlkLFxuICAgICAgfSk7XG4gICAgfVxuICAgIGJhdGNoLmNsYWltZWRJbnN0YW5jZXMgPSByZXNwb25zZS5jbGFpbWVkSW5zdGFuY2VzO1xuICAgIGJhdGNoLnRvdGFsSW5zdGFuY2VzID0gcmVzcG9uc2UudG90YWxJbnN0YW5jZXM7XG4gIH1cblxuICBpZiAoYmF0Y2guc3BlY3MubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEJhdGNoIGNhbiBoYXZlIG11bHRpcGxlIHNwZWNzLiBXaGlsZSBydW5uaW5nIHRoZSBzcGVjcyxcbiAgICogY3lwcmVzcyBjYW4gaGFyZC1jcmFzaCB3aXRob3V0IHJlcG9ydGluZyBhbnkgcmVzdWx0LlxuICAgKlxuICAgKiBXaGVuIGNyYXNoZWQsIGlkZWFsbHksIHdlIG5lZWQgdG86XG4gICAqIC0gZGV0ZXJtaW5lIHdoaWNoIHNwZWMgY3Jhc2hlZFxuICAgKiAtIGFzc29jaWF0ZSB0aGUgY3Jhc2ggd2l0aCB0aGUgc3BlY1xuICAgKiAtIHJ1biB0aGUgcmVzdCBvZiB1bnJlcG9ydGVkIHNwZWNzIGluIHRoZSBiYXRjaFxuICAgKlxuICAgKiBCdXQgZGV0ZWN0aW5nIHRoZSBjcmFzaGVkIHNwZWMgaXMgZXJyb3ItcHJvbmUgYW5kIGluYWNjdXJhdGUsXG4gICAqIHNvIHdlIGZhbGwgYmFjayB0byByZXBvcnRpbmcgaGFyZCBjcmFzaCB0byBhbGwgc3Vic2VxdWVudFxuICAgKiBzcGVjcyBpbiB0aGUgYmF0Y2guXG4gICAqXG4gICAqIFdvcnN0LWNhc2Ugc2NlbmFyaW86IHdlIHJlcG9ydCBoYXJkIGNyYXNoIHRvIGFsbCBzcGVjcyBpbiB0aGUgYmF0Y2guXG4gICAqL1xuXG4gIC8vICVzdGF0ZVxuICBiYXRjaC5zcGVjcy5mb3JFYWNoKChpKSA9PiBleGVjdXRpb25TdGF0ZS5pbml0SW5zdGFuY2UoaSkpO1xuXG4gIGRpdmlkZXIoKTtcbiAgaW5mbyhcbiAgICBcIlJ1bm5pbmc6ICVzICglZC8lZClcIixcbiAgICBiYXRjaC5zcGVjcy5tYXAoKHMpID0+IHMuc3BlYykuam9pbihcIiwgXCIpLFxuICAgIGJhdGNoLmNsYWltZWRJbnN0YW5jZXMsXG4gICAgYmF0Y2gudG90YWxJbnN0YW5jZXNcbiAgKTtcblxuICBjb25zdCBiYXRjaGVkUmVzdWx0ID0gYXdhaXQgcnVuU3BlY0ZpbGVTYWZlKFxuICAgIHtcbiAgICAgIC8vIHVzZSBhYnNvbHV0ZSBwYXRocyAtIHVzZXIgY2FuIHJ1biB0aGUgcHJvZ3JhbSBmcm9tIGEgZGlmZmVyZW50IGRpcmVjdG9yeSwgZS5nLiBueCBvciBhIG1vbm9yZXBvIHdvcmtzcGFjZVxuICAgICAgLy8gY3lwcmVzcyBzdGlsbCByZXBvcnQgdGhlIHBhdGggcmVsYXRpdmUgdG8gdGhlIHByb2plY3Qgcm9vdFxuICAgICAgc3BlYzogYmF0Y2guc3BlY3NcbiAgICAgICAgLm1hcCgoYnMpID0+IGdldFNwZWNBYnNvbHV0ZVBhdGgoYWxsU3BlY3MsIGJzLnNwZWMpKVxuICAgICAgICAuam9pbihcIixcIiksXG4gICAgfSxcbiAgICBwYXJhbXNcbiAgKTtcblxuICB0aXRsZShcImJsdWVcIiwgXCJSZXBvcnRpbmcgcmVzdWx0cyBhbmQgYXJ0aWZhY3RzIGluIGJhY2tncm91bmQuLi5cIik7XG5cbiAgY29uc3Qgb3V0cHV0ID0gZ2V0Q2FwdHVyZWRPdXRwdXQoKTtcblxuICBiYXRjaC5zcGVjcy5mb3JFYWNoKChzcGVjKSA9PiB7XG4gICAgZXhlY3V0aW9uU3RhdGUuc2V0SW5zdGFuY2VPdXRwdXQoc3BlYy5pbnN0YW5jZUlkLCBvdXRwdXQpO1xuXG4gICAgY29uc3Qgc2luZ2xlU3BlY1Jlc3VsdCA9IGdldFNpbmdsZVNwZWNSdW5SZXN1bHQoc3BlYy5zcGVjLCBiYXRjaGVkUmVzdWx0KTtcbiAgICBpZiAoIXNpbmdsZVNwZWNSZXN1bHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBnZXRQdWJTdWIoKS5lbWl0KEV2ZW50LlJVTl9SRVNVTFQsIHtcbiAgICAgIHNwZWNSZWxhdGl2ZTogc3BlYy5zcGVjLFxuICAgICAgaW5zdGFuY2VJZDogc3BlYy5pbnN0YW5jZUlkLFxuICAgICAgcnVuUmVzdWx0OiBzaW5nbGVTcGVjUmVzdWx0LFxuICAgIH0pO1xuICB9KTtcblxuICByZXNldENhcHR1cmUoKTtcblxuICByZXR1cm4gYmF0Y2guc3BlY3M7XG59XG5cbmZ1bmN0aW9uIGdldFNpbmdsZVNwZWNSdW5SZXN1bHQoXG4gIHNwZWNSZWxhdGl2ZTogc3RyaW5nLFxuICBiYXRjaGVkUmVzdWx0OiBDeXByZXNzVHlwZXMuTW9kdWxlQVBJLlJlc3VsdFxuKTogQ3lwcmVzc1R5cGVzLk1vZHVsZUFQSS5Db21wbGV0ZWRSZXN1bHQgfCB1bmRlZmluZWQge1xuICBpZiAoIU1vZHVsZUFQSVJlc3VsdHMuaXNTdWNjZXNzUmVzdWx0KGJhdGNoZWRSZXN1bHQpKSB7XG4gICAgLy8gVE9ETzogcmV0dXJuIGR1bW15IHJlc3VsdCBmb3IgbWlzc2luZyBzcGVjIHJlc3VsdHM/XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgcnVuID0gYmF0Y2hlZFJlc3VsdC5ydW5zLmZpbmQoKHIpID0+IHIuc3BlYy5yZWxhdGl2ZSA9PT0gc3BlY1JlbGF0aXZlKTtcbiAgaWYgKCFydW4pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLmJhdGNoZWRSZXN1bHQsXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJ1bnM6IFtydW5dLFxuICB9O1xufVxuXG5mdW5jdGlvbiBnZXRTcGVjQWJzb2x1dGVQYXRoKFxuICBhbGxTcGVjczogU3BlY1dpdGhSZWxhdGl2ZVJvb3RbXSxcbiAgcmVsYXRpdmU6IHN0cmluZ1xuKSB7XG4gIGNvbnN0IGFic29sdXRlUGF0aCA9IGFsbFNwZWNzLmZpbmQoKGkpID0+IGkucmVsYXRpdmUgPT09IHJlbGF0aXZlKT8uYWJzb2x1dGU7XG4gIGlmICghYWJzb2x1dGVQYXRoKSB7XG4gICAgd2FybihcbiAgICAgICdDYW5ub3QgZmluZCBhYnNvbHV0ZSBwYXRoIGZvciBzcGVjLiBTcGVjOiBcIiVzXCIsIGNhbmRpZGF0ZXM6ICVvJyxcbiAgICAgIHJlbGF0aXZlLFxuICAgICAgYWxsU3BlY3NcbiAgICApO1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgYWJzb2x1dGUgcGF0aCBmb3Igc3BlY2ApO1xuICB9XG4gIHJldHVybiBhYnNvbHV0ZVBhdGg7XG59XG4iLCAiaW1wb3J0IHsgSW5zdGFuY2VJZCB9IGZyb20gXCJjeXByZXNzLWNsb3VkL3R5cGVzXCI7XG5pbXBvcnQgRGVidWcgZnJvbSBcImRlYnVnXCI7XG5pbXBvcnQgeyBlcnJvciB9IGZyb20gXCIuLi9sb2dcIjtcbmltcG9ydCB7IGdldFJlcG9ydFJlc3VsdHNUYXNrIH0gZnJvbSBcIi4uL3Jlc3VsdHNcIjtcbmltcG9ydCB7IENvbmZpZ1N0YXRlLCBFeGVjdXRpb25TdGF0ZSB9IGZyb20gXCIuLi9zdGF0ZVwiO1xuXG5jb25zdCBkZWJ1ZyA9IERlYnVnKFwiY3VycmVudHM6cmVwb3J0VGFza1wiKTtcblxuZXhwb3J0IGNvbnN0IHJlcG9ydFRhc2tzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuXG5leHBvcnQgY29uc3QgY3JlYXRlUmVwb3J0VGFzayA9IChcbiAgY29uZmlnU3RhdGU6IENvbmZpZ1N0YXRlLFxuICBleGVjdXRpb25TdGF0ZTogRXhlY3V0aW9uU3RhdGUsXG4gIGluc3RhbmNlSWQ6IEluc3RhbmNlSWRcbikgPT4ge1xuICBjb25zdCBpbnN0YW5jZSA9IGV4ZWN1dGlvblN0YXRlLmdldEluc3RhbmNlKGluc3RhbmNlSWQpO1xuICBpZiAoIWluc3RhbmNlKSB7XG4gICAgZXJyb3IoXCJDYW5ub3QgZmluZCBleGVjdXRpb24gc3RhdGUgZm9yIGluc3RhbmNlICVzXCIsIGluc3RhbmNlSWQpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoaW5zdGFuY2UucmVwb3J0U3RhcnRlZEF0KSB7XG4gICAgZGVidWcoXCJSZXBvcnQgdGFzayBhbHJlYWR5IGNyZWF0ZWQgZm9yIGluc3RhbmNlICVzXCIsIGluc3RhbmNlSWQpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGluc3RhbmNlLnJlcG9ydFN0YXJ0ZWRBdCA9IG5ldyBEYXRlKCk7XG5cbiAgZGVidWcoXCJDcmVhdGluZyByZXBvcnQgdGFzayBmb3IgaW5zdGFuY2VJZCAlc1wiLCBpbnN0YW5jZUlkKTtcbiAgcmVwb3J0VGFza3MucHVzaChcbiAgICBnZXRSZXBvcnRSZXN1bHRzVGFzayhcbiAgICAgIGluc3RhbmNlSWQsXG4gICAgICBleGVjdXRpb25TdGF0ZSxcbiAgICAgIGNvbmZpZ1N0YXRlLFxuICAgICAgaW5zdGFuY2Uub3V0cHV0ID8/IFwibm8gb3V0cHV0IGNhcHR1cmVkXCIsXG4gICAgICBpbnN0YW5jZS5jb3ZlcmFnZUZpbGVQYXRoXG4gICAgKS5jYXRjaChlcnJvcilcbiAgKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVSZXBvcnRUYXNrU3BlYyA9IChcbiAgY29uZmlnU3RhdGU6IENvbmZpZ1N0YXRlLFxuICBleGVjdXRpb25TdGF0ZTogRXhlY3V0aW9uU3RhdGUsXG4gIHNwZWM6IHN0cmluZ1xuKSA9PiB7XG4gIGNvbnN0IGkgPSBleGVjdXRpb25TdGF0ZS5nZXRTcGVjKHNwZWMpO1xuICBpZiAoIWkpIHtcbiAgICBlcnJvcihcIkNhbm5vdCBmaW5kIGV4ZWN1dGlvbiBzdGF0ZSBmb3Igc3BlYyAlc1wiLCBzcGVjKTtcbiAgICByZXR1cm47XG4gIH1cbiAgZGVidWcoXCJDcmVhdGluZyByZXBvcnQgdGFzayBmb3Igc3BlYyAlc1wiLCBzcGVjKTtcbiAgcmV0dXJuIGNyZWF0ZVJlcG9ydFRhc2soY29uZmlnU3RhdGUsIGV4ZWN1dGlvblN0YXRlLCBpLmluc3RhbmNlSWQpO1xufTtcbiIsICJpbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBNZXJnZWRDb25maWcgfSBmcm9tIFwiLi4vY29uZmlnXCI7XG5pbXBvcnQgeyBTdGFuZGFyZCB9IGZyb20gXCIuLi9jeXByZXNzLnR5cGVzXCI7XG5pbXBvcnQgeyBlbXB0eVN0YXRzIH0gZnJvbSBcIi4vZW1wdHlcIjtcbmltcG9ydCB7IE1vZHVsZUFQSVJlc3VsdHMgfSBmcm9tIFwiLi9tb2R1bGVBUElSZXN1bHRcIjtcblxuZXhwb3J0IGNvbnN0IHN1bW1hcml6ZUV4ZWN1dGlvbiA9IChcbiAgaW5wdXQ6IFN0YW5kYXJkLk1vZHVsZUFQSS5Db21wbGV0ZWRSZXN1bHRbXSxcbiAgY29uZmlnOiBNZXJnZWRDb25maWdcbik6IFN0YW5kYXJkLk1vZHVsZUFQSS5Db21wbGV0ZWRSZXN1bHQgPT4ge1xuICBpZiAoIWlucHV0Lmxlbmd0aCkge1xuICAgIHJldHVybiBNb2R1bGVBUElSZXN1bHRzLmdldEVtcHR5UmVzdWx0KGNvbmZpZyk7XG4gIH1cblxuICBjb25zdCBvdmVyYWxsID0gaW5wdXQucmVkdWNlKFxuICAgIChcbiAgICAgIGFjYyxcbiAgICAgIHtcbiAgICAgICAgdG90YWxEdXJhdGlvbixcbiAgICAgICAgdG90YWxGYWlsZWQsXG4gICAgICAgIHRvdGFsUGFzc2VkLFxuICAgICAgICB0b3RhbFBlbmRpbmcsXG4gICAgICAgIHRvdGFsU2tpcHBlZCxcbiAgICAgICAgdG90YWxUZXN0cyxcbiAgICAgICAgdG90YWxTdWl0ZXMsXG4gICAgICB9XG4gICAgKSA9PiAoe1xuICAgICAgdG90YWxEdXJhdGlvbjogYWNjLnRvdGFsRHVyYXRpb24gKyB0b3RhbER1cmF0aW9uLFxuICAgICAgdG90YWxTdWl0ZXM6IGFjYy50b3RhbFN1aXRlcyArIHRvdGFsU3VpdGVzLFxuICAgICAgdG90YWxQZW5kaW5nOiBhY2MudG90YWxQZW5kaW5nICsgdG90YWxQZW5kaW5nLFxuICAgICAgdG90YWxGYWlsZWQ6IGFjYy50b3RhbEZhaWxlZCArIHRvdGFsRmFpbGVkLFxuICAgICAgdG90YWxTa2lwcGVkOiBhY2MudG90YWxTa2lwcGVkICsgdG90YWxTa2lwcGVkLFxuICAgICAgdG90YWxQYXNzZWQ6IGFjYy50b3RhbFBhc3NlZCArIHRvdGFsUGFzc2VkLFxuICAgICAgdG90YWxUZXN0czogYWNjLnRvdGFsVGVzdHMgKyB0b3RhbFRlc3RzLFxuICAgIH0pLFxuICAgIGVtcHR5U3RhdHNcbiAgKTtcbiAgY29uc3QgZmlyc3RSZXN1bHQgPSBpbnB1dFswXTtcbiAgY29uc3Qgc3RhcnRJdGVtcyA9IGlucHV0Lm1hcCgoaSkgPT4gaS5zdGFydGVkVGVzdHNBdCkuc29ydCgpO1xuICBjb25zdCBlbmRJdGVtcyA9IGlucHV0Lm1hcCgoaSkgPT4gaS5lbmRlZFRlc3RzQXQpLnNvcnQoKTtcbiAgY29uc3QgcnVucyA9IGlucHV0Lm1hcCgoaSkgPT4gaS5ydW5zKS5mbGF0KCk7XG4gIHJldHVybiB7XG4gICAgLi4ub3ZlcmFsbCxcbiAgICBydW5zLFxuICAgIHN0YXJ0ZWRUZXN0c0F0OiBfLmZpcnN0KHN0YXJ0SXRlbXMpIGFzIHN0cmluZyxcbiAgICBlbmRlZFRlc3RzQXQ6IF8ubGFzdChlbmRJdGVtcykgYXMgc3RyaW5nLFxuICAgIC4uLl8ucGljayhcbiAgICAgIGZpcnN0UmVzdWx0LFxuICAgICAgXCJicm93c2VyTmFtZVwiLFxuICAgICAgXCJicm93c2VyVmVyc2lvblwiLFxuICAgICAgXCJicm93c2VyUGF0aFwiLFxuICAgICAgXCJvc05hbWVcIixcbiAgICAgIFwib3NWZXJzaW9uXCIsXG4gICAgICBcImN5cHJlc3NWZXJzaW9uXCIsXG4gICAgICBcImNvbmZpZ1wiXG4gICAgKSxcbiAgICBzdGF0dXM6IFwiZmluaXNoZWRcIixcbiAgfTtcbn07XG4iLCAiaW1wb3J0IHsgU3RhbmRhcmQgfSBmcm9tIFwiLi4vY3lwcmVzcy50eXBlc1wiO1xuaW1wb3J0IHsgQ29uZmlnU3RhdGUgfSBmcm9tIFwiLi4vc3RhdGVcIjtcblxuZXhwb3J0IGNvbnN0IGVtcHR5U3RhdHMgPSB7XG4gIHRvdGFsRHVyYXRpb246IDAsXG4gIHRvdGFsU3VpdGVzOiAwLFxuICB0b3RhbFBlbmRpbmc6IDAsXG4gIHRvdGFsRmFpbGVkOiAwLFxuICB0b3RhbFNraXBwZWQ6IDAsXG4gIHRvdGFsUGFzc2VkOiAwLFxuICB0b3RhbFRlc3RzOiAwLFxufTtcblxuY29uc3QgZ2V0RHVtbXlGYWlsZWRUZXN0ID0gKFxuICBzdGFydDogc3RyaW5nLFxuICBlcnJvcjogc3RyaW5nXG4pOiBTdGFuZGFyZC5Nb2R1bGVBUEkuVGVzdCA9PiAoe1xuICB0aXRsZTogW1wiVW5rbm93blwiXSxcbiAgc3RhdGU6IFwiZmFpbGVkXCIsXG4gIGJvZHk6IFwiLy8gVGhpcyB0ZXN0IGlzIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIGR1ZSB0byBleGVjdXRpb24gZmFpbHVyZVwiLFxuICBkaXNwbGF5RXJyb3I6IGVycm9yLFxuICBhdHRlbXB0czogW1xuICAgIHtcbiAgICAgIHN0YXRlOiBcImZhaWxlZFwiLFxuICAgICAgc3RhcnRlZEF0OiBzdGFydCxcbiAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgdmlkZW9UaW1lc3RhbXA6IDAsXG4gICAgICBzY3JlZW5zaG90czogW10sXG4gICAgICBlcnJvcjoge1xuICAgICAgICBuYW1lOiBcIkN5cHJlc3NFeGVjdXRpb25FcnJvclwiLFxuICAgICAgICBtZXNzYWdlOiBlcnJvcixcbiAgICAgICAgc3RhY2s6IFwiXCIsXG4gICAgICAgIGNvZGVGcmFtZTogbnVsbCxcbiAgICAgIH0sXG4gICAgfSxcbiAgXSxcbn0pO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmFpbGVkRmFrZUluc3RhbmNlUmVzdWx0KFxuICBjb25maWdTdGF0ZTogQ29uZmlnU3RhdGUsXG4gIHtcbiAgICBzcGVjcyxcbiAgICBlcnJvcixcbiAgfToge1xuICAgIHNwZWNzOiBzdHJpbmdbXTtcbiAgICBlcnJvcjogc3RyaW5nO1xuICB9XG4pOiBTdGFuZGFyZC5Nb2R1bGVBUEkuQ29tcGxldGVkUmVzdWx0IHtcbiAgY29uc3Qgc3RhcnQgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG4gIGNvbnN0IGVuZCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgcmV0dXJuIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uZmlnOiBjb25maWdTdGF0ZS5nZXRDb25maWcoKSA/PyB7fSxcbiAgICBzdGF0dXM6IFwiZmluaXNoZWRcIixcbiAgICBzdGFydGVkVGVzdHNBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIGVuZGVkVGVzdHNBdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgIHRvdGFsRHVyYXRpb246IDAsXG4gICAgdG90YWxTdWl0ZXM6IDEsXG4gICAgdG90YWxGYWlsZWQ6IDEsXG4gICAgdG90YWxQYXNzZWQ6IDAsXG4gICAgdG90YWxQZW5kaW5nOiAwLFxuICAgIHRvdGFsU2tpcHBlZDogMCxcbiAgICB0b3RhbFRlc3RzOiAxLFxuICAgIGJyb3dzZXJOYW1lOiBcInVua25vd25cIixcbiAgICBicm93c2VyVmVyc2lvbjogXCJ1bmtub3duXCIsXG4gICAgYnJvd3NlclBhdGg6IFwidW5rbm93blwiLFxuICAgIG9zTmFtZTogXCJ1bmtub3duXCIsXG4gICAgb3NWZXJzaW9uOiBcInVua25vd25cIixcbiAgICBjeXByZXNzVmVyc2lvbjogXCJ1bmtub3duXCIsXG4gICAgcnVuczogc3BlY3MubWFwKChzKSA9PiAoe1xuICAgICAgc3RhdHM6IHtcbiAgICAgICAgc3VpdGVzOiAxLFxuICAgICAgICB0ZXN0czogMSxcbiAgICAgICAgcGFzc2VzOiAwLFxuICAgICAgICBwZW5kaW5nOiAwLFxuICAgICAgICBza2lwcGVkOiAwLFxuICAgICAgICBmYWlsdXJlczogMSxcbiAgICAgICAgc3RhcnRlZEF0OiBzdGFydCxcbiAgICAgICAgZW5kZWRBdDogZW5kLFxuICAgICAgICBkdXJhdGlvbjogMCxcbiAgICAgIH0sXG4gICAgICByZXBvcnRlcjogXCJzcGVjXCIsXG4gICAgICByZXBvcnRlclN0YXRzOiB7XG4gICAgICAgIHN1aXRlczogMSxcbiAgICAgICAgdGVzdHM6IDEsXG4gICAgICAgIHBhc3NlczogMCxcbiAgICAgICAgcGVuZGluZzogMCxcbiAgICAgICAgZmFpbHVyZXM6IDEsXG4gICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgfSxcbiAgICAgIGhvb2tzOiBbXSxcbiAgICAgIGVycm9yLFxuICAgICAgdmlkZW86IG51bGwsXG4gICAgICBzcGVjOiB7XG4gICAgICAgIG5hbWU6IHMsXG4gICAgICAgIHJlbGF0aXZlOiBzLFxuICAgICAgICBhYnNvbHV0ZTogcyxcbiAgICAgICAgcmVsYXRpdmVUb0NvbW1vblJvb3Q6IHMsXG4gICAgICAgIGJhc2VOYW1lOiBzLFxuICAgICAgICBzcGVjVHlwZTogXCJpbnRlZ3JhdGlvblwiLFxuICAgICAgICBmaWxlRXh0ZW5zaW9uOiBcImpzXCIsXG4gICAgICAgIGZpbGVOYW1lOiBzLFxuICAgICAgICBzcGVjRmlsZUV4dGVuc2lvbjogXCJqc1wiLFxuICAgICAgfSxcbiAgICAgIHRlc3RzOiBbZ2V0RHVtbXlGYWlsZWRUZXN0KHN0YXJ0LCBlcnJvcildLFxuICAgICAgc2hvdWxkVXBsb2FkVmlkZW86IGZhbHNlLFxuICAgICAgc2tpcHBlZFNwZWM6IGZhbHNlLFxuICAgIH0pKSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgZ2V0Q29tbW9uUGF0aFByZWZpeCBmcm9tIFwiY29tbW9uLXBhdGgtcHJlZml4XCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHByZXR0eU1TIGZyb20gXCJwcmV0dHktbXNcIjtcbmltcG9ydCB7IHRhYmxlIH0gZnJvbSBcInRhYmxlXCI7XG5pbXBvcnQgeyBTdGFuZGFyZCB9IGZyb20gXCIuLi9jeXByZXNzLnR5cGVzXCI7XG5pbXBvcnQgeyBjeWFuLCBncmF5LCBncmVlbiwgcmVkLCB3aGl0ZSB9IGZyb20gXCIuLi9sb2dcIjtcblxuY29uc3QgZmFpbHVyZUljb24gPSByZWQoXCJcdTI3MTZcIik7XG5jb25zdCBzdWNjZXNzSWNvbiA9IGdyZWVuKFwiXHUyNzE0XCIpO1xuXG5leHBvcnQgY29uc3Qgc3VtbWFyeVRhYmxlID0gKHI6IFN0YW5kYXJkLk1vZHVsZUFQSS5Db21wbGV0ZWRSZXN1bHQpID0+IHtcbiAgY29uc3Qgb3ZlcmFsbFNwZWNDb3VudCA9IHIucnVucy5sZW5ndGg7XG4gIGNvbnN0IGZhaWxlZFNwZWNzQ291bnQgPSBfLnN1bShcbiAgICByLnJ1bnMuZmlsdGVyKCh2KSA9PiB2LnN0YXRzLmZhaWx1cmVzICsgdi5zdGF0cy5za2lwcGVkID4gMCkubWFwKCgpID0+IDEpXG4gICk7XG4gIGNvbnN0IGhhc0ZhaWxlZCA9IGZhaWxlZFNwZWNzQ291bnQgPiAwO1xuXG4gIGNvbnN0IHZlcmRpY3QgPSBoYXNGYWlsZWRcbiAgICA/IHJlZChgJHtmYWlsZWRTcGVjc0NvdW50fSBvZiAke292ZXJhbGxTcGVjQ291bnR9IGZhaWxlZGApXG4gICAgOiBvdmVyYWxsU3BlY0NvdW50ID4gMFxuICAgID8gXCJBbGwgc3BlY3MgcGFzc2VkIVwiXG4gICAgOiBcIk5vIHNwZWNzIGV4ZWN1dGVkXCI7XG5cbiAgY29uc3Qgc3BlY3MgPSByLnJ1bnMubWFwKChyKSA9PiByLnNwZWMucmVsYXRpdmUpO1xuICBjb25zdCBjb21tb25QYXRoID0gZ2V0Q29tbW9uUGF0aChzcGVjcyk7XG4gIGNvbnN0IGRhdGEgPSByLnJ1bnMubWFwKChyKSA9PiBbXG4gICAgci5zdGF0cy5mYWlsdXJlcyArIHIuc3RhdHMuc2tpcHBlZCA+IDAgPyBmYWlsdXJlSWNvbiA6IHN1Y2Nlc3NJY29uLFxuICAgIHN0cmlwQ29tbW9uUGF0aChyLnNwZWMucmVsYXRpdmUsIGNvbW1vblBhdGgpLFxuICAgIGdyYXkocHJldHR5TVMoci5zdGF0cy5kdXJhdGlvbiA/PyAwKSksXG4gICAgd2hpdGUoci5zdGF0cy50ZXN0cyA/PyAwKSxcbiAgICByLnN0YXRzLnBhc3NlcyA/IGdyZWVuKHIuc3RhdHMucGFzc2VzKSA6IGdyYXkoXCItXCIpLFxuICAgIHIuc3RhdHMuZmFpbHVyZXMgPyByZWQoci5zdGF0cy5mYWlsdXJlcykgOiBncmF5KFwiLVwiKSxcbiAgICByLnN0YXRzLnBlbmRpbmcgPyBjeWFuKHIuc3RhdHMucGVuZGluZykgOiBncmF5KFwiLVwiKSxcbiAgICByLnN0YXRzLnNraXBwZWQgPyByZWQoci5zdGF0cy5za2lwcGVkKSA6IGdyYXkoXCItXCIpLFxuICBdKTtcblxuICByZXR1cm4gdGFibGUoXG4gICAgW1xuICAgICAgW1xuICAgICAgICBcIlwiLCAvLyBtYXJrZXJcbiAgICAgICAgZ3JheShcIlNwZWNcIiksXG4gICAgICAgIFwiXCIsXG4gICAgICAgIGdyYXkoXCJUZXN0c1wiKSxcbiAgICAgICAgZ3JheShcIlBhc3NpbmdcIiksXG4gICAgICAgIGdyYXkoXCJGYWlsaW5nXCIpLFxuICAgICAgICBncmF5KFwiUGVuZGluZ1wiKSxcbiAgICAgICAgZ3JheShcIlNraXBwZWRcIiksXG4gICAgICBdLFxuICAgICAgLi4uZGF0YSxcbiAgICAgIFtcbiAgICAgICAgaGFzRmFpbGVkID8gZmFpbHVyZUljb24gOiBzdWNjZXNzSWNvbiwgLy8gbWFya2VyXG4gICAgICAgIHZlcmRpY3QsXG4gICAgICAgIGdyYXkocHJldHR5TVMoci50b3RhbER1cmF0aW9uID8/IDApKSxcbiAgICAgICAgb3ZlcmFsbFNwZWNDb3VudCA+IDAgPyB3aGl0ZShyLnRvdGFsVGVzdHMgPz8gMCkgOiBncmF5KFwiLVwiKSxcbiAgICAgICAgci50b3RhbFBhc3NlZCA/IGdyZWVuKHIudG90YWxQYXNzZWQpIDogZ3JheShcIi1cIiksXG4gICAgICAgIHIudG90YWxGYWlsZWQgPyByZWQoci50b3RhbEZhaWxlZCkgOiBncmF5KFwiLVwiKSxcbiAgICAgICAgci50b3RhbFBlbmRpbmcgPyBjeWFuKHIudG90YWxQZW5kaW5nKSA6IGdyYXkoXCItXCIpLFxuICAgICAgICByLnRvdGFsU2tpcHBlZCA/IHJlZChyLnRvdGFsU2tpcHBlZCkgOiBncmF5KFwiLVwiKSxcbiAgICAgIF0sXG4gICAgXSxcbiAgICB7XG4gICAgICBib3JkZXIsXG4gICAgICBjb2x1bW5EZWZhdWx0OiB7XG4gICAgICAgIHdpZHRoOiA4LFxuICAgICAgfSxcbiAgICAgIGNvbHVtbnM6IFtcbiAgICAgICAgeyBhbGlnbm1lbnQ6IFwibGVmdFwiLCB3aWR0aDogMiB9LFxuICAgICAgICB7IGFsaWdubWVudDogXCJsZWZ0XCIsIHdpZHRoOiAzMCB9LFxuICAgICAgICB7IGFsaWdubWVudDogXCJyaWdodFwiIH0sXG4gICAgICAgIHsgYWxpZ25tZW50OiBcInJpZ2h0XCIgfSxcbiAgICAgICAgeyBhbGlnbm1lbnQ6IFwicmlnaHRcIiB9LFxuICAgICAgICB7IGFsaWdubWVudDogXCJyaWdodFwiIH0sXG4gICAgICAgIHsgYWxpZ25tZW50OiBcInJpZ2h0XCIgfSxcbiAgICAgICAgeyBhbGlnbm1lbnQ6IFwicmlnaHRcIiB9LFxuICAgICAgXSxcbiAgICAgIC8vIHNpbmdsZUxpbmU6IHRydWUsXG4gICAgICBkcmF3SG9yaXpvbnRhbExpbmU6IChsaW5lSW5kZXgsIHJvd0NvdW50KSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgbGluZUluZGV4ID09PSAxIHx8XG4gICAgICAgICAgbGluZUluZGV4ID09PSAwIHx8XG4gICAgICAgICAgbGluZUluZGV4ID09PSByb3dDb3VudCAtIDEgfHxcbiAgICAgICAgICBsaW5lSW5kZXggPT09IHJvd0NvdW50XG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgZHJhd1ZlcnRpY2FsTGluZTogKGxpbmVJbmRleCwgcm93Q291bnQpID0+IHtcbiAgICAgICAgcmV0dXJuIGxpbmVJbmRleCA9PT0gMCB8fCByb3dDb3VudCA9PT0gbGluZUluZGV4O1xuICAgICAgfSxcbiAgICB9XG4gICk7XG59O1xuXG5jb25zdCBib3JkZXIgPSBfLm1hcFZhbHVlcyhcbiAge1xuICAgIHRvcEJvZHk6IGBcdTI1MDBgLFxuICAgIHRvcEpvaW46IGBcdTI1MkNgLFxuICAgIHRvcExlZnQ6IGAgIFx1MjUwQ2AsXG4gICAgdG9wUmlnaHQ6IGBcdTI1MTBgLFxuXG4gICAgYm90dG9tQm9keTogYFx1MjUwMGAsXG4gICAgYm90dG9tSm9pbjogYFx1MjUzNGAsXG4gICAgYm90dG9tTGVmdDogYCAgXHUyNTE0YCxcbiAgICBib3R0b21SaWdodDogYFx1MjUxOGAsXG5cbiAgICBib2R5TGVmdDogYCAgXHUyNTAyYCxcbiAgICBib2R5UmlnaHQ6IGBcdTI1MDJgLFxuICAgIGJvZHlKb2luOiBgXHUyNTAyYCxcblxuICAgIGpvaW5Cb2R5OiBgXHUyNTAwYCxcbiAgICBqb2luTGVmdDogYCAgXHUyNTFDYCxcbiAgICBqb2luUmlnaHQ6IGBcdTI1MjRgLFxuICAgIGpvaW5Kb2luOiBgXHUyNTNDYCxcbiAgfSxcbiAgKHYpID0+IGdyYXkodilcbik7XG5cbmZ1bmN0aW9uIGdldENvbW1vblBhdGgoc3BlY3M6IHN0cmluZ1tdKSB7XG4gIGlmIChzcGVjcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxuICBpZiAoc3BlY3MubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIHBhdGguZGlybmFtZShzcGVjc1swXSkgKyBwYXRoLnNlcDtcbiAgfVxuICByZXR1cm4gZ2V0Q29tbW9uUGF0aFByZWZpeChzcGVjcyk7XG59XG5mdW5jdGlvbiBzdHJpcENvbW1vblBhdGgoc3BlYzogc3RyaW5nLCBjb21tb25QYXRoOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHNwZWMucmVwbGFjZShjb21tb25QYXRoLCBcIlwiKTtcbn1cbiIsICJpbXBvcnQgRGVidWcgZnJvbSBcImRlYnVnXCI7XG5pbXBvcnQge1xuICBJbnN0YW5jZUFQSVBheWxvYWQsXG4gIHJlcG9ydEluc3RhbmNlUmVzdWx0c01lcmdlZCxcbiAgc2V0SW5zdGFuY2VUZXN0cyxcbiAgdXBkYXRlSW5zdGFuY2VSZXN1bHRzLFxufSBmcm9tIFwiLi4vYXBpXCI7XG5pbXBvcnQgeyB1cGxvYWRBcnRpZmFjdHMsIHVwbG9hZFN0ZG91dFNhZmUgfSBmcm9tIFwiLi4vYXJ0aWZhY3RzXCI7XG5pbXBvcnQgeyBzZXRDYW5jZWxsYXRpb25SZWFzb24gfSBmcm9tIFwiLi4vY2FuY2VsbGF0aW9uXCI7XG5pbXBvcnQgeyBnZXRJbml0aWFsT3V0cHV0IH0gZnJvbSBcIi4uL2NhcHR1cmVcIjtcbmltcG9ydCB7IGlzQ3VycmVudHMgfSBmcm9tIFwiLi4vZW52XCI7XG5pbXBvcnQgeyBDb25maWdTdGF0ZSwgRXhlY3V0aW9uU3RhdGUgfSBmcm9tIFwiLi4vc3RhdGVcIjtcbmltcG9ydCB7IGdldEluc3RhbmNlUmVzdWx0UGF5bG9hZCwgZ2V0SW5zdGFuY2VUZXN0c1BheWxvYWQgfSBmcm9tIFwiLi9hcGlcIjtcblxuY29uc3QgZGVidWcgPSBEZWJ1ZyhcImN1cnJlbnRzOnJlc3VsdHNcIik7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRSZXBvcnRSZXN1bHRzVGFzayhcbiAgaW5zdGFuY2VJZDogc3RyaW5nLFxuICBleGVjdXRpb25TdGF0ZTogRXhlY3V0aW9uU3RhdGUsXG4gIGNvbmZpZ1N0YXRlOiBDb25maWdTdGF0ZSxcbiAgc3Rkb3V0OiBzdHJpbmcsXG4gIGNvdmVyYWdlRmlsZVBhdGg/OiBzdHJpbmdcbikge1xuICBjb25zdCByZXN1bHRzID0gZXhlY3V0aW9uU3RhdGUuZ2V0SW5zdGFuY2VSZXN1bHRzKGNvbmZpZ1N0YXRlLCBpbnN0YW5jZUlkKTtcbiAgY29uc3QgcnVuID0gcmVzdWx0cy5ydW5zWzBdO1xuICBpZiAoIXJ1bikge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHJ1biBmb3VuZCBpbiBDeXByZXNzIHJlc3VsdHNcIik7XG4gIH1cbiAgY29uc3QgaW5zdGFuY2VSZXN1bHRzID0gZ2V0SW5zdGFuY2VSZXN1bHRQYXlsb2FkKHJ1biwgY292ZXJhZ2VGaWxlUGF0aCk7XG4gIGNvbnN0IGluc3RhbmNlVGVzdHMgPSBnZXRJbnN0YW5jZVRlc3RzUGF5bG9hZChydW4sIGNvbmZpZ1N0YXRlKTtcblxuICAvLyAlIHNhdmUgcmVzdWx0c1xuICAvLyB3cml0ZURhdGFUb0ZpbGUoXG4gIC8vICAgSlNPTi5zdHJpbmdpZnkoe1xuICAvLyAgICAgdGVzdHM6IGluc3RhbmNlVGVzdHMsXG4gIC8vICAgICByZXN1bHRzOiBpbnN0YW5jZVJlc3VsdHMsXG4gIC8vICAgfSksXG4gIC8vICAgZ2V0U3BlY1Nob3J0TmFtZShyZXN1bHRzLnJ1bnNbMF0uc3BlYy5yZWxhdGl2ZSksXG4gIC8vICAgXCJhcGlDYWxsXCJcbiAgLy8gKTtcblxuICBjb25zdCB7IHZpZGVvVXBsb2FkVXJsLCBzY3JlZW5zaG90VXBsb2FkVXJscywgY292ZXJhZ2VVcGxvYWRVcmwsIGNsb3VkIH0gPVxuICAgIGF3YWl0IHJlcG9ydFJlc3VsdHMoaW5zdGFuY2VJZCwgaW5zdGFuY2VUZXN0cywgaW5zdGFuY2VSZXN1bHRzKTtcblxuICBpZiAoY2xvdWQ/LnNob3VsZENhbmNlbCkge1xuICAgIGRlYnVnKFwiaW5zdGFuY2UgJXMgc2hvdWxkIGNhbmNlbFwiLCBpbnN0YW5jZUlkKTtcbiAgICBzZXRDYW5jZWxsYXRpb25SZWFzb24oY2xvdWQuc2hvdWxkQ2FuY2VsKTtcbiAgfVxuXG4gIGRlYnVnKFwiaW5zdGFuY2UgJXMgYXJ0aWZhY3QgdXBsb2FkIGluc3RydWN0aW9ucyAlb1wiLCBpbnN0YW5jZUlkLCB7XG4gICAgdmlkZW9VcGxvYWRVcmwsXG4gICAgc2NyZWVuc2hvdFVwbG9hZFVybHMsXG4gICAgY292ZXJhZ2VVcGxvYWRVcmwsXG4gIH0pO1xuXG4gIHJldHVybiBQcm9taXNlLmFsbChbXG4gICAgdXBsb2FkQXJ0aWZhY3RzKHtcbiAgICAgIGV4ZWN1dGlvblN0YXRlLFxuICAgICAgdmlkZW9VcGxvYWRVcmwsXG4gICAgICB2aWRlb1BhdGg6IHJ1bi52aWRlbyxcbiAgICAgIHNjcmVlbnNob3RVcGxvYWRVcmxzLFxuICAgICAgc2NyZWVuc2hvdHM6IGluc3RhbmNlUmVzdWx0cy5zY3JlZW5zaG90cyxcbiAgICAgIGNvdmVyYWdlVXBsb2FkVXJsLFxuICAgICAgY292ZXJhZ2VGaWxlUGF0aCxcbiAgICB9KSxcbiAgICB1cGxvYWRTdGRvdXRTYWZlKGluc3RhbmNlSWQsIGdldEluaXRpYWxPdXRwdXQoKSArIHN0ZG91dCksXG4gIF0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZXBvcnRSZXN1bHRzKFxuICBpbnN0YW5jZUlkOiBzdHJpbmcsXG4gIGluc3RhbmNlVGVzdHM6IEluc3RhbmNlQVBJUGF5bG9hZC5TZXRJbnN0YW5jZVRlc3RzUGF5bG9hZCxcbiAgaW5zdGFuY2VSZXN1bHRzOiBJbnN0YW5jZUFQSVBheWxvYWQuVXBkYXRlSW5zdGFuY2VSZXN1bHRzUGF5bG9hZFxuKSB7XG4gIGRlYnVnKFwicmVwb3J0aW5nIGluc3RhbmNlICVzIHJlc3VsdHMuLi5cIiwgaW5zdGFuY2VJZCk7XG4gIGlmIChpc0N1cnJlbnRzKCkpIHtcbiAgICByZXR1cm4gcmVwb3J0SW5zdGFuY2VSZXN1bHRzTWVyZ2VkKGluc3RhbmNlSWQsIHtcbiAgICAgIHRlc3RzOiBpbnN0YW5jZVRlc3RzLFxuICAgICAgcmVzdWx0czogaW5zdGFuY2VSZXN1bHRzLFxuICAgIH0pO1xuICB9XG5cbiAgLy8gcnVuIG9uZSBhZnRlciBhbm90aGVyXG4gIGF3YWl0IHNldEluc3RhbmNlVGVzdHMoaW5zdGFuY2VJZCwgaW5zdGFuY2VUZXN0cyk7XG4gIHJldHVybiB1cGRhdGVJbnN0YW5jZVJlc3VsdHMoaW5zdGFuY2VJZCwgaW5zdGFuY2VSZXN1bHRzKTtcbn1cbiIsICJpbXBvcnQgRGVidWcgZnJvbSBcImRlYnVnXCI7XG5pbXBvcnQgeyBTY3JlZW5zaG90QXJ0aWZhY3QsIFNjcmVlbnNob3RVcGxvYWRJbnN0cnVjdGlvbiB9IGZyb20gXCIuLi90eXBlc1wiO1xuaW1wb3J0IHsgdXBkYXRlSW5zdGFuY2VTdGRvdXQgfSBmcm9tIFwiLi9hcGlcIjtcbmltcG9ydCB7IHNhZmUgfSBmcm9tIFwiLi9sYW5nXCI7XG5pbXBvcnQgeyBkaW0gfSBmcm9tIFwiLi9sb2dcIjtcbmltcG9ydCB7IEV4ZWN1dGlvblN0YXRlIH0gZnJvbSBcIi4vc3RhdGVcIjtcbmltcG9ydCB7IHVwbG9hZEltYWdlLCB1cGxvYWRKc29uLCB1cGxvYWRWaWRlbyB9IGZyb20gXCIuL3VwbG9hZFwiO1xuY29uc3QgZGVidWcgPSBEZWJ1ZyhcImN1cnJlbnRzOmFydGlmYWN0c1wiKTtcbmludGVyZmFjZSBVcGxvYWRBcnRpZmFjdHMge1xuICBleGVjdXRpb25TdGF0ZTogRXhlY3V0aW9uU3RhdGU7XG4gIHZpZGVvUGF0aDogc3RyaW5nIHwgbnVsbDtcbiAgdmlkZW9VcGxvYWRVcmw/OiBzdHJpbmcgfCBudWxsO1xuICBzY3JlZW5zaG90czogU2NyZWVuc2hvdEFydGlmYWN0W107XG4gIHNjcmVlbnNob3RVcGxvYWRVcmxzOiBTY3JlZW5zaG90VXBsb2FkSW5zdHJ1Y3Rpb25bXTtcbiAgY292ZXJhZ2VVcGxvYWRVcmw/OiBzdHJpbmcgfCBudWxsO1xuICBjb3ZlcmFnZUZpbGVQYXRoPzogc3RyaW5nIHwgbnVsbDtcbn1cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1cGxvYWRBcnRpZmFjdHMoe1xuICBleGVjdXRpb25TdGF0ZSxcbiAgdmlkZW9QYXRoLFxuICB2aWRlb1VwbG9hZFVybCxcbiAgc2NyZWVuc2hvdHMsXG4gIHNjcmVlbnNob3RVcGxvYWRVcmxzLFxuICBjb3ZlcmFnZUZpbGVQYXRoLFxuICBjb3ZlcmFnZVVwbG9hZFVybCxcbn06IFVwbG9hZEFydGlmYWN0cykge1xuICBkZWJ1ZyhcInVwbG9hZGluZyBhcnRpZmFjdHM6ICVvXCIsIHtcbiAgICB2aWRlb1BhdGgsXG4gICAgdmlkZW9VcGxvYWRVcmwsXG4gICAgc2NyZWVuc2hvdHMsXG4gICAgc2NyZWVuc2hvdFVwbG9hZFVybHMsXG4gICAgY292ZXJhZ2VGaWxlUGF0aCxcbiAgICBjb3ZlcmFnZVVwbG9hZFVybCxcbiAgfSk7XG5cbiAgY29uc3QgdG90YWxVcGxvYWRzID1cbiAgICAodmlkZW9QYXRoID8gMSA6IDApICsgc2NyZWVuc2hvdHMubGVuZ3RoICsgKGNvdmVyYWdlVXBsb2FkVXJsID8gMSA6IDApO1xuICBpZiAodG90YWxVcGxvYWRzID09PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gdXBsb2FkIHZpZGVvXG4gIGlmICh2aWRlb1VwbG9hZFVybCAmJiB2aWRlb1BhdGgpIHtcbiAgICBhd2FpdCBzYWZlKFxuICAgICAgdXBsb2FkVmlkZW8sXG4gICAgICAoZSkgPT4ge1xuICAgICAgICBkZWJ1ZyhcImZhaWxlZCB1cGxvYWRpbmcgdmlkZW8gJXMuIEVycm9yOiAlb1wiLCB2aWRlb1BhdGgsIGUpO1xuICAgICAgICBleGVjdXRpb25TdGF0ZS5hZGRXYXJuaW5nKFxuICAgICAgICAgIGBGYWlsZWQgdXBsb2FkaW5nIHZpZGVvICR7dmlkZW9QYXRofS5cXG4ke2RpbShlKX1gXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgKCkgPT4gZGVidWcoXCJzdWNjZXNzIHVwbG9hZGluZ1wiLCB2aWRlb1BhdGgpXG4gICAgKSh2aWRlb1BhdGgsIHZpZGVvVXBsb2FkVXJsKTtcbiAgfVxuICAvLyB1cGxvYWQgc2NyZWVuc2hvdHNcbiAgaWYgKHNjcmVlbnNob3RVcGxvYWRVcmxzICYmIHNjcmVlbnNob3RVcGxvYWRVcmxzLmxlbmd0aCkge1xuICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgc2NyZWVuc2hvdHMubWFwKChzY3JlZW5zaG90KSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IHNjcmVlbnNob3RVcGxvYWRVcmxzLmZpbmQoXG4gICAgICAgICAgKHVybHMpID0+IHVybHMuc2NyZWVuc2hvdElkID09PSBzY3JlZW5zaG90LnNjcmVlbnNob3RJZFxuICAgICAgICApPy51cGxvYWRVcmw7XG4gICAgICAgIGlmICghdXJsKSB7XG4gICAgICAgICAgZGVidWcoXG4gICAgICAgICAgICBcIk5vIHVwbG9hZCB1cmwgZm9yIHNjcmVlbnNob3QgJW8sIHNjcmVlbnNob3RVcGxvYWRVcmxzOiAlb1wiLFxuICAgICAgICAgICAgc2NyZWVuc2hvdCxcbiAgICAgICAgICAgIHNjcmVlbnNob3RVcGxvYWRVcmxzXG4gICAgICAgICAgKTtcbiAgICAgICAgICBleGVjdXRpb25TdGF0ZS5hZGRXYXJuaW5nKFxuICAgICAgICAgICAgYE5vIHVwbG9hZCBVUkwgZm9yIHNjcmVlbnNob3QgJHtzY3JlZW5zaG90LnBhdGh9YFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzYWZlKFxuICAgICAgICAgIHVwbG9hZEltYWdlLFxuICAgICAgICAgIChlKSA9PiB7XG4gICAgICAgICAgICBkZWJ1ZyhcbiAgICAgICAgICAgICAgXCJmYWlsZWQgdXBsb2FkaW5nIHNjcmVlbnNob3QgJXMuIEVycm9yOiAlb1wiLFxuICAgICAgICAgICAgICBzY3JlZW5zaG90LnBhdGgsXG4gICAgICAgICAgICAgIGVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBleGVjdXRpb25TdGF0ZS5hZGRXYXJuaW5nKFxuICAgICAgICAgICAgICBgRmFpbGVkIHVwbG9hZGluZyBzY3JlZW5zaG90ICR7c2NyZWVuc2hvdC5wYXRofS5cXG4ke2RpbShlKX1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgKCkgPT4gZGVidWcoXCJzdWNjZXNzIHVwbG9hZGluZ1wiLCBzY3JlZW5zaG90LnBhdGgpXG4gICAgICAgICkoc2NyZWVuc2hvdC5wYXRoLCB1cmwpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG4gIC8vIHVwbG9hZCBjb3ZlcmFnZVxuICBpZiAoY292ZXJhZ2VVcGxvYWRVcmwgJiYgY292ZXJhZ2VGaWxlUGF0aCkge1xuICAgIGF3YWl0IHNhZmUoXG4gICAgICB1cGxvYWRKc29uLFxuICAgICAgKGUpID0+IHtcbiAgICAgICAgZGVidWcoXG4gICAgICAgICAgXCJmYWlsZWQgdXBsb2FkaW5nIGNvdmVyYWdlIGZpbGUgJXMuIEVycm9yOiAlb1wiLFxuICAgICAgICAgIGNvdmVyYWdlRmlsZVBhdGgsXG4gICAgICAgICAgZVxuICAgICAgICApO1xuXG4gICAgICAgIGV4ZWN1dGlvblN0YXRlLmFkZFdhcm5pbmcoXG4gICAgICAgICAgYEZhaWxlZCB1cGxvYWRpbmcgY292ZXJhZ2UgZmlsZSAke2NvdmVyYWdlRmlsZVBhdGh9LlxcbiR7ZGltKGUpfWBcbiAgICAgICAgKTtcbiAgICAgIH0sXG5cbiAgICAgICgpID0+IGRlYnVnKFwic3VjY2VzcyB1cGxvYWRpbmdcIiwgY292ZXJhZ2VGaWxlUGF0aClcbiAgICApKGNvdmVyYWdlRmlsZVBhdGgsIGNvdmVyYWdlVXBsb2FkVXJsKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgdXBsb2FkU3Rkb3V0U2FmZSA9IHNhZmUoXG4gIHVwZGF0ZUluc3RhbmNlU3Rkb3V0LFxuICAoKSA9PiB7fSxcbiAgKCkgPT4ge31cbik7XG4iLCAiaW1wb3J0IERlYnVnIGZyb20gXCJkZWJ1Z1wiO1xuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgbWFrZVJlcXVlc3QgfSBmcm9tIFwiLi9odHRwQ2xpZW50XCI7XG5jb25zdCByZWFkRmlsZSA9IGZzLnByb21pc2VzLnJlYWRGaWxlO1xuY29uc3QgZGVidWcgPSBEZWJ1ZyhcImN1cnJlbnRzOnVwbG9hZFwiKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHVwbG9hZFZpZGVvKGZpbGU6IHN0cmluZywgdXJsOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHVwbG9hZEZpbGUoZmlsZSwgdXJsLCBcInZpZGVvL21wNFwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwbG9hZEltYWdlKGZpbGU6IHN0cmluZywgdXJsOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHVwbG9hZEZpbGUoZmlsZSwgdXJsLCBcImltYWdlL3BuZ1wiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwbG9hZEpzb24oZmlsZTogc3RyaW5nLCB1cmw6IHN0cmluZykge1xuICByZXR1cm4gdXBsb2FkRmlsZShmaWxlLCB1cmwsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbn1cblxudHlwZSBVcGxvYWRUeXBlcyA9XG4gIHwgXCJ2aWRlby9tcDRcIlxuICB8IFwiaW1hZ2UvcG5nXCJcbiAgfCBcInBsYWluL3RleHRcIlxuICB8IFwiYXBwbGljYXRpb24vanNvblwiO1xuYXN5bmMgZnVuY3Rpb24gdXBsb2FkRmlsZShmaWxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCB0eXBlOiBVcGxvYWRUeXBlcykge1xuICBkZWJ1ZygndXBsb2FkaW5nIGZpbGUgXCIlc1wiIHRvIFwiJXNcIicsIGZpbGUsIHVybCk7XG4gIGNvbnN0IGYgPSBhd2FpdCByZWFkRmlsZShmaWxlKTtcbiAgYXdhaXQgbWFrZVJlcXVlc3Qoe1xuICAgIHVybCxcbiAgICBtZXRob2Q6IFwiUFVUXCIsXG4gICAgZGF0YTogZixcbiAgICBoZWFkZXJzOiB7XG4gICAgICBcIkNvbnRlbnQtVHlwZVwiOiB0eXBlLFxuICAgICAgXCJDb250ZW50LURpc3Bvc2l0aW9uXCI6IGBpbmxpbmVgLFxuICAgIH0sXG4gIH0pO1xufVxuIiwgImltcG9ydCB7IEV2ZW50LCBnZXRQdWJTdWIgfSBmcm9tIFwiLi4vcHVic3ViXCI7XG5cbmludGVyZmFjZSBFeGVjdXRpb25TdGF0ZSB7XG4gIGNhbmNlbGxhdGlvblJlYXNvbjogc3RyaW5nIHwgbnVsbDtcbn1cbmNvbnN0IHN0YXRlOiBFeGVjdXRpb25TdGF0ZSA9IHtcbiAgY2FuY2VsbGF0aW9uUmVhc29uOiBudWxsLFxufTtcblxuZXhwb3J0IGNvbnN0IHNldENhbmNlbGxhdGlvblJlYXNvbiA9IChyZWFzb246IHN0cmluZykgPT4ge1xuICBpZiAoc3RhdGUuY2FuY2VsbGF0aW9uUmVhc29uKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHN0YXRlLmNhbmNlbGxhdGlvblJlYXNvbiA9IHJlYXNvbjtcbiAgZ2V0UHViU3ViKCkuZW1pdChFdmVudC5SVU5fQ0FOQ0VMTEVELCByZWFzb24pO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldENhbmNlbGxhdGlvblJlYXNvbiA9ICgpID0+IHN0YXRlLmNhbmNlbGxhdGlvblJlYXNvbjtcbiIsICJpbXBvcnQgRGVidWcgZnJvbSBcImRlYnVnXCI7XG5pbXBvcnQgeyBJbnN0YW5jZUFQSVBheWxvYWQgfSBmcm9tIFwiLi4vYXBpXCI7XG5cbmltcG9ydCB7IFN0YW5kYXJkIH0gZnJvbSBcIi4uL2N5cHJlc3MudHlwZXNcIjtcbmltcG9ydCB7IGdldFJhbmRvbVN0cmluZyB9IGZyb20gXCIuLi9uYW5vXCI7XG5pbXBvcnQgeyBDb25maWdTdGF0ZSB9IGZyb20gXCIuLi9zdGF0ZVwiO1xuXG5jb25zdCBkZWJ1ZyA9IERlYnVnKFwiY3VycmVudHM6cmVzdWx0c1wiKTtcblxuZXhwb3J0IGNvbnN0IGdldEluc3RhbmNlUmVzdWx0UGF5bG9hZCA9IChcbiAgcnVuUmVzdWx0OiBTdGFuZGFyZC5Nb2R1bGVBUEkuUnVuLFxuICBjb3ZlcmFnZUZpbGVQYXRoPzogc3RyaW5nXG4pOiBJbnN0YW5jZUFQSVBheWxvYWQuVXBkYXRlSW5zdGFuY2VSZXN1bHRzUGF5bG9hZCA9PiB7XG4gIGRlYnVnKFwiZ2VuZXJhdGluZyBpbnN0YW5jZSByZXN1bHQgcGF5bG9hZCBmcm9tICVvXCIsIHJ1blJlc3VsdCk7XG4gIHJldHVybiB7XG4gICAgc3RhdHM6IFN0YW5kYXJkUmVzdWx0c1RvQVBJUmVzdWx0cy5nZXRTdGF0cyhydW5SZXN1bHQuc3RhdHMpLFxuICAgIHJlcG9ydGVyU3RhdHM6IHJ1blJlc3VsdC5yZXBvcnRlclN0YXRzLFxuICAgIGV4Y2VwdGlvbjogcnVuUmVzdWx0LmVycm9yID8/IG51bGwsXG4gICAgdmlkZW86ICEhcnVuUmVzdWx0LnZpZGVvLCAvLyBEaWQgdGhlIGluc3RhbmNlIGdlbmVyYXRlIGEgdmlkZW8/XG4gICAgc2NyZWVuc2hvdHM6IFN0YW5kYXJkUmVzdWx0c1RvQVBJUmVzdWx0cy5nZXRBbGxTY3JlZW5zaG90cyhydW5SZXN1bHQpLFxuICAgIGhhc0NvdmVyYWdlOiAhIWNvdmVyYWdlRmlsZVBhdGgsXG4gICAgdGVzdHM6IChydW5SZXN1bHQudGVzdHMgPz8gW10pLm1hcChcbiAgICAgIFN0YW5kYXJkUmVzdWx0c1RvQVBJUmVzdWx0cy5nZXRUZXN0Rm9yUmVzdWx0c1xuICAgICksXG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0SW5zdGFuY2VUZXN0c1BheWxvYWQgPSAoXG4gIHJ1blJlc3VsdDogU3RhbmRhcmQuTW9kdWxlQVBJLlJ1bixcbiAgY29uZmlnOiBDb25maWdTdGF0ZVxuKTogSW5zdGFuY2VBUElQYXlsb2FkLlNldEluc3RhbmNlVGVzdHNQYXlsb2FkID0+IHtcbiAgcmV0dXJuIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uZmlnOiB7XG4gICAgICAuLi5jb25maWcuZ2V0Q29uZmlnKCksXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB2aWRlb1VwbG9hZE9uUGFzc2VzOiBjb25maWcuZ2V0Q29uZmlnKCk/LnZpZGVvVXBsb2FkT25QYXNzZXMgPz8gdHJ1ZSxcbiAgICB9LFxuICAgIHRlc3RzOiAocnVuUmVzdWx0LnRlc3RzID8/IFtdKS5tYXAoXG4gICAgICBTdGFuZGFyZFJlc3VsdHNUb0FQSVJlc3VsdHMuZ2V0VGVzdEZvclNldFRlc3RzXG4gICAgKSxcbiAgICBob29rczogcnVuUmVzdWx0Lmhvb2tzLFxuICB9O1xufTtcblxuLyoqXG4gKiBNYXAgc3RhbmRhcmQgcmVzdWx0cyB0byBBUEkgcmVzdWx0XG4gKi9cbmNsYXNzIFN0YW5kYXJkUmVzdWx0c1RvQVBJUmVzdWx0cyB7XG4gIHN0YXRpYyBnZXRUZXN0QXR0ZW1wdChcbiAgICBhdHRlbXB0OiBTdGFuZGFyZC5Nb2R1bGVBUEkuVGVzdEF0dGVtcHRcbiAgKTogSW5zdGFuY2VBUElQYXlsb2FkLlRlc3RBdHRlbXB0IHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdGU6IGF0dGVtcHQuc3RhdGUsXG4gICAgICBlcnJvcjogYXR0ZW1wdC5lcnJvcixcbiAgICAgIHdhbGxDbG9ja1N0YXJ0ZWRBdDogYXR0ZW1wdC5zdGFydGVkQXQsXG4gICAgICB3YWxsQ2xvY2tEdXJhdGlvbjogYXR0ZW1wdC5kdXJhdGlvbixcbiAgICAgIHZpZGVvVGltZXN0YW1wOiBhdHRlbXB0LnZpZGVvVGltZXN0YW1wLFxuICAgIH07XG4gIH1cbiAgc3RhdGljIGdldFRlc3RGb3JSZXN1bHRzKFxuICAgIHRlc3Q6IFN0YW5kYXJkLk1vZHVsZUFQSS5UZXN0LFxuICAgIGluZGV4OiBudW1iZXJcbiAgKTogSW5zdGFuY2VBUElQYXlsb2FkLlNldFJlc3VsdHNUZXN0c1BheWxvYWQge1xuICAgIHJldHVybiB7XG4gICAgICBkaXNwbGF5RXJyb3I6IHRlc3QuZGlzcGxheUVycm9yLFxuICAgICAgc3RhdGU6IHRlc3Quc3RhdGUsXG4gICAgICBhdHRlbXB0czogKHRlc3QuYXR0ZW1wdHMgPz8gW10pLm1hcChcbiAgICAgICAgU3RhbmRhcmRSZXN1bHRzVG9BUElSZXN1bHRzLmdldFRlc3RBdHRlbXB0XG4gICAgICApLFxuICAgICAgY2xpZW50SWQ6IGByJHtpbmRleH1gLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0VGVzdEZvclNldFRlc3RzKFxuICAgIHRlc3Q6IFN0YW5kYXJkLk1vZHVsZUFQSS5UZXN0LFxuICAgIGluZGV4OiBudW1iZXJcbiAgKTogSW5zdGFuY2VBUElQYXlsb2FkLlNldFRlc3RzUGF5bG9hZCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJvZHk6IFwicmVkYWN0ZWRcIixcbiAgICAgIHRpdGxlOiB0ZXN0LnRpdGxlLFxuICAgICAgY2xpZW50SWQ6IGByJHtpbmRleH1gLFxuICAgIH07XG4gIH1cbiAgc3RhdGljIGdldEFsbFNjcmVlbnNob3RzKFxuICAgIHJ1bjogU3RhbmRhcmQuTW9kdWxlQVBJLlJ1blxuICApOiBJbnN0YW5jZUFQSVBheWxvYWQuVXBkYXRlSW5zdGFuY2VSZXN1bHRzUGF5bG9hZFtcInNjcmVlbnNob3RzXCJdIHtcbiAgICByZXR1cm4gKHJ1bi50ZXN0cyA/PyBbXSkuZmxhdE1hcCgodCwgaSkgPT5cbiAgICAgIHQuYXR0ZW1wdHMuZmxhdE1hcCgoYSwgaikgPT5cbiAgICAgICAgYS5zY3JlZW5zaG90cy5tYXAoKHMpID0+ICh7XG4gICAgICAgICAgLi4ucyxcbiAgICAgICAgICB0ZXN0SWQ6IGByJHtpfWAsXG4gICAgICAgICAgdGVzdEF0dGVtcHRJbmRleDogaixcbiAgICAgICAgICBzY3JlZW5zaG90SWQ6IGdldFJhbmRvbVN0cmluZygpLFxuICAgICAgICB9KSlcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgc3RhdGljIGdldFN0YXRzKFxuICAgIHN0YXRzOiBTdGFuZGFyZC5Nb2R1bGVBUEkuUnVuW1wic3RhdHNcIl1cbiAgKTogSW5zdGFuY2VBUElQYXlsb2FkLlVwZGF0ZUluc3RhbmNlUmVzdWx0c1BheWxvYWRbXCJzdGF0c1wiXSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnN0YXRzLFxuICAgICAgd2FsbENsb2NrRHVyYXRpb246IHN0YXRzLmR1cmF0aW9uLFxuICAgICAgd2FsbENsb2NrU3RhcnRlZEF0OiBzdGF0cy5zdGFydGVkQXQsXG4gICAgICB3YWxsQ2xvY2tFbmRlZEF0OiBzdGF0cy5lbmRlZEF0LFxuICAgIH07XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBCUHJvbWlzZSB9IGZyb20gXCIuLi9sYW5nXCI7XG5pbXBvcnQgeyB3YXJuIH0gZnJvbSBcIi4uL2xvZ1wiO1xuaW1wb3J0IHsgRXZlbnQsIGdldFB1YlN1YiB9IGZyb20gXCIuLi9wdWJzdWJcIjtcbmltcG9ydCB7IHJ1blRpbGxEb25lIH0gZnJvbSBcIi4vcnVubmVyXCI7XG5cbmxldCBjYW5jZWxsYWJsZToge1xuICBjYW5jZWw6ICgpID0+IHZvaWQ7XG59IHwgbnVsbCA9IG51bGw7XG5cbmZ1bmN0aW9uIG9uUnVuQ2FuY2VsbGVkKHJlYXNvbjogc3RyaW5nKSB7XG4gIHdhcm4oXG4gICAgYFJ1biBjYW5jZWxsZWQ6ICVzLiBXYWl0aW5nIGZvciB1cGxvYWRzIHRvIGNvbXBsZXRlIGFuZCBzdG9wcGluZyBleGVjdXRpb24uLi5gLFxuICAgIHJlYXNvblxuICApO1xuICBjYW5jZWxsYWJsZT8uY2FuY2VsKCk7XG59XG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuVGlsbERvbmVPckNhbmNlbGxlZChcbiAgLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgcnVuVGlsbERvbmU+XG4pIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChfcmVzb2x2ZSwgX3JlamVjdCkgPT4ge1xuICAgIGNhbmNlbGxhYmxlID0gbmV3IEJQcm9taXNlKChyZXNvbHZlLCByZWplY3QsIG9uQ2FuY2VsKSA9PiB7XG4gICAgICBpZiAoIW9uQ2FuY2VsKSB7XG4gICAgICAgIF9yZWplY3QobmV3IEVycm9yKFwiQmx1ZUJpcmQgaXMgbWlzY29uZmlndXJlZDogb25DYW5jZWwgaXMgdW5kZWZpbmVkXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgb25DYW5jZWwoKCkgPT4gX3Jlc29sdmUodm9pZCAwKSk7XG4gICAgICBydW5UaWxsRG9uZSguLi5hcmdzKS50aGVuKFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIF9yZXNvbHZlKHZvaWQgMCk7XG4gICAgICAgIH0sXG4gICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgIF9yZWplY3QoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgZ2V0UHViU3ViKCkuYWRkTGlzdGVuZXIoRXZlbnQuUlVOX0NBTkNFTExFRCwgb25SdW5DYW5jZWxsZWQpO1xuICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICBnZXRQdWJTdWIoKS5yZW1vdmVMaXN0ZW5lcihFdmVudC5SVU5fQ0FOQ0VMTEVELCBvblJ1bkNhbmNlbGxlZCk7XG4gIH0pO1xufVxuIiwgImltcG9ydCBEZWJ1ZyBmcm9tIFwiZGVidWdcIjtcbmltcG9ydCB7IERldGVjdGVkQnJvd3NlciwgUGxhdGZvcm0gfSBmcm9tIFwiLi4vLi4vdHlwZXNcIjtcbmltcG9ydCB7IHdhcm4gfSBmcm9tIFwiLi4vbG9nXCI7XG5cbmNvbnN0IGRlYnVnID0gRGVidWcoXCJjdXJyZW50czpicm93c2VyXCIpO1xuXG5leHBvcnQgZnVuY3Rpb24gZ3Vlc3NCcm93c2VyKFxuICBicm93c2VyOiBzdHJpbmcsXG4gIGF2YWlsYWJsZUJyb3dzZXJzOiBEZXRlY3RlZEJyb3dzZXJbXSA9IFtdXG4pOiBQaWNrPFBsYXRmb3JtLCBcImJyb3dzZXJOYW1lXCIgfCBcImJyb3dzZXJWZXJzaW9uXCI+IHtcbiAgZGVidWcoXG4gICAgXCJndWVzc2luZyBicm93c2VyIGZyb20gJyVzJywgYXZhaWxhYmxlIGJyb3dzZXJzOiAlb1wiLFxuICAgIGJyb3dzZXIsXG4gICAgYXZhaWxhYmxlQnJvd3NlcnNcbiAgKTtcbiAgLy8gdHJ5IGlkZW50aWZ5aW5nIHRoZSBicm93c2VyIGJ5IG5hbWUgZmlyc3RcbiAgbGV0IHJlc3VsdCA9IGF2YWlsYWJsZUJyb3dzZXJzLmZpbmQoKGIpID0+IGIubmFtZSA9PT0gYnJvd3Nlcik7XG5cbiAgaWYgKHJlc3VsdCkge1xuICAgIGRlYnVnKFwiaWRlbnRpZmllZCBicm93c2VyIGJ5IG5hbWU6ICVvXCIsIHJlc3VsdCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJyb3dzZXJOYW1lOiByZXN1bHQuZGlzcGxheU5hbWUsXG4gICAgICBicm93c2VyVmVyc2lvbjogcmVzdWx0LnZlcnNpb24sXG4gICAgfTtcbiAgfVxuXG4gIC8vIG90aGVyd2lzZSwgdHJ5IGlkZW50aWZ5aW5nIGJ5IHRoZSBwYXRoXG4gIHJlc3VsdCA9IGF2YWlsYWJsZUJyb3dzZXJzLmZpbmQoKGIpID0+IGIucGF0aCA9PT0gYnJvd3Nlcik7XG4gIGlmIChyZXN1bHQpIHtcbiAgICBkZWJ1ZyhcImlkZW50aWZpZWQgYnJvd3NlciBieSBwYXRoOiAlb1wiLCByZXN1bHQpO1xuICAgIHJldHVybiB7XG4gICAgICBicm93c2VyTmFtZTogcmVzdWx0LmRpc3BsYXlOYW1lID8/IHJlc3VsdC5uYW1lLFxuICAgICAgYnJvd3NlclZlcnNpb246IHJlc3VsdC52ZXJzaW9uLFxuICAgIH07XG4gIH1cblxuICB3YXJuKFwiVW5hYmxlIHRvIGlkZW50aWZ5IGJyb3dzZXIgbmFtZSBhbmQgdmVyc2lvblwiKTtcblxuICAvLyBvdGhlcndpc2UsIHJldHVybiBkdW1teSBicm93c2VyXG4gIHJldHVybiB7XG4gICAgYnJvd3Nlck5hbWU6IFwidW5rbm93blwiLFxuICAgIGJyb3dzZXJWZXJzaW9uOiBcInVua25vd25cIixcbiAgfTtcbn1cbiIsICJpbXBvcnQgRGVidWcgZnJvbSBcImRlYnVnXCI7XG5pbXBvcnQgZ2V0b3MgZnJvbSBcImdldG9zXCI7XG5pbXBvcnQgeyBjcHVzLCBmcmVlbWVtLCBwbGF0Zm9ybSwgcmVsZWFzZSwgdG90YWxtZW0gfSBmcm9tIFwib3NcIjtcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gXCJ1dGlsXCI7XG5cbmNvbnN0IGRlYnVnID0gRGVidWcoXCJjdXJyZW50czpwbGF0Zm9ybVwiKTtcblxuY29uc3QgZ2V0T3NWZXJzaW9uID0gYXN5bmMgKCkgPT4ge1xuICBpZiAocGxhdGZvcm0oKSA9PT0gXCJsaW51eFwiKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGxpbnV4T3MgPSBhd2FpdCBwcm9taXNpZnkoZ2V0b3MpKCk7XG4gICAgICBpZiAoXCJkaXN0XCIgaW4gbGludXhPcyAmJiBcInJlbGVhc2VcIiBpbiBsaW51eE9zKSB7XG4gICAgICAgIHJldHVybiBbbGludXhPcy5kaXN0LCBsaW51eE9zLnJlbGVhc2VdLmpvaW4oXCIgLSBcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcmVsZWFzZSgpO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIHJlbGVhc2UoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlbGVhc2UoKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRQbGF0Zm9ybUluZm8gPSBhc3luYyAoKSA9PiB7XG4gIGNvbnN0IG9zVmVyc2lvbiA9IGF3YWl0IGdldE9zVmVyc2lvbigpO1xuICBjb25zdCByZXN1bHQgPSB7XG4gICAgb3NOYW1lOiBwbGF0Zm9ybSgpLFxuICAgIG9zVmVyc2lvbixcbiAgICBvc0NwdXM6IGNwdXMoKSxcbiAgICBvc01lbW9yeToge1xuICAgICAgZnJlZTogZnJlZW1lbSgpLFxuICAgICAgdG90YWw6IHRvdGFsbWVtKCksXG4gICAgfSxcbiAgfTtcbiAgZGVidWcoXCJwbGF0Zm9ybSBpbmZvOiAlb1wiLCByZXN1bHQpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsICJpbXBvcnQgeyBNZXJnZWRDb25maWcgfSBmcm9tIFwiLi4vY29uZmlnXCI7XG5pbXBvcnQgeyBndWVzc0Jyb3dzZXIgfSBmcm9tIFwiLi9icm93c2VyXCI7XG5pbXBvcnQgeyBnZXRQbGF0Zm9ybUluZm8gfSBmcm9tIFwiLi9wbGF0Zm9ybVwiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGxhdGZvcm0oe1xuICBicm93c2VyLFxuICBjb25maWcsXG59OiB7XG4gIGJyb3dzZXI/OiBzdHJpbmc7XG4gIGNvbmZpZzogTWVyZ2VkQ29uZmlnO1xufSkge1xuICByZXR1cm4ge1xuICAgIC4uLihhd2FpdCBnZXRQbGF0Zm9ybUluZm8oKSksXG4gICAgLi4uZ3Vlc3NCcm93c2VyKGJyb3dzZXIgPz8gXCJlbGVjdHJvblwiLCBjb25maWcucmVzb2x2ZWQ/LmJyb3dzZXJzKSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyBzdG9wV1NTIH0gZnJvbSBcIi4vd3NcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNodXRkb3duKCkge1xuICBhd2FpdCBzdG9wV1NTKCk7XG59XG4iLCAiLyohIEBwcmVzZXJ2ZVxuXG4jIyMgTUlUXG5cblBhcnRzIG9mIHRoaXMgY29kZSB3YXMgY29waWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2N5cHJlc3MtaW8vY3lwcmVzcyBhbmQgaXMgc3ViamVjdCB0byBNSVQgbGljZW5zZS5cblxuTUlUIExpY2Vuc2VcblxuQ29weXJpZ2h0IChjKSAyMDIyIEN5cHJlc3MuaW9cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbmNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcblNPRlRXQVJFLlxuKi9cblxuaW1wb3J0IERlYnVnIGZyb20gXCJkZWJ1Z1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuaW1wb3J0IGNvbW1vblBhdGhQcmVmaXggZnJvbSBcImNvbW1vbi1wYXRoLXByZWZpeFwiO1xuaW1wb3J0IGdsb2JieSwgeyBHbG9iYnlPcHRpb25zIH0gZnJvbSBcImdsb2JieVwiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IG9zIGZyb20gXCJvc1wiO1xuaW1wb3J0IHtcbiAgRmluZFNwZWNzLFxuICBTcGVjVHlwZSxcbiAgU3BlY1dpdGhSZWxhdGl2ZVJvb3QsXG4gIFRlc3RpbmdUeXBlLFxufSBmcm9tIFwiLi4vLi4vdHlwZXNcIjtcbmltcG9ydCB7IHRvQXJyYXksIHRvUG9zaXggfSBmcm9tIFwiLi4vdXRpbHNcIjtcblxuY29uc3QgZGVidWcgPSBEZWJ1ZyhcImN1cnJlbnRzOnNwZWNzXCIpO1xuXG50eXBlIEdsb2JQYXR0ZXJuID0gc3RyaW5nIHwgc3RyaW5nW107XG5cbi8qKlxuICogUmVwbGljYXRlIGhvdyBjeXByZXNzIGlzIGRpc2NvdmVyaW5nIHNwZWMgZmlsZXNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jeXByZXNzLWlvL2N5cHJlc3MvYmxvYi9iYzllZGI0NDUyM2Q2MmNhOTM0ODI3YjhlODcwZjM4Zjg2NjM0Y2E0L3BhY2thZ2VzL2RhdGEtY29udGV4dC9zcmMvc291cmNlcy9Qcm9qZWN0RGF0YVNvdXJjZS50cyNMMjUwXG4gKiBodHRwczovL2dpdGh1Yi5jb20vY3lwcmVzcy1pby9jeXByZXNzL2Jsb2IvYmM5ZWRiNDQ1MjNkNjJjYTkzNDgyN2I4ZTg3MGYzOGY4NjYzNGNhNC9wYWNrYWdlcy9kYXRhLWNvbnRleHQvc3JjL2FjdGlvbnMvUHJvamVjdEFjdGlvbnMudHMjTDQxN1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluZFNwZWNzKHtcbiAgcHJvamVjdFJvb3QsXG4gIHRlc3RpbmdUeXBlLFxuICBzcGVjUGF0dGVybixcbiAgY29uZmlnU3BlY1BhdHRlcm4sXG4gIGV4Y2x1ZGVTcGVjUGF0dGVybixcbiAgYWRkaXRpb25hbElnbm9yZVBhdHRlcm4sXG59OiBGaW5kU3BlY3M8c3RyaW5nW10gfCBzdHJpbmc+KTogUHJvbWlzZTxTcGVjV2l0aFJlbGF0aXZlUm9vdFtdPiB7XG4gIGNvbmZpZ1NwZWNQYXR0ZXJuID0gdG9BcnJheShjb25maWdTcGVjUGF0dGVybik7XG4gIHNwZWNQYXR0ZXJuID0gdG9BcnJheShzcGVjUGF0dGVybik7XG4gIGV4Y2x1ZGVTcGVjUGF0dGVybiA9IHRvQXJyYXkoZXhjbHVkZVNwZWNQYXR0ZXJuKSB8fCBbXTtcblxuICAvLyBleGNsdWRlIGFsbCBzcGVjcyBtYXRjaGluZyBlMmUgaWYgaW4gY29tcG9uZW50IHRlc3RpbmdcbiAgYWRkaXRpb25hbElnbm9yZVBhdHRlcm4gPSB0b0FycmF5KGFkZGl0aW9uYWxJZ25vcmVQYXR0ZXJuKSB8fCBbXTtcblxuICBkZWJ1ZyhcImV4cGxvcmluZyBzcGVjIGZpbGVzIGZvciBleGVjdXRpb24gJU9cIiwge1xuICAgIHRlc3RpbmdUeXBlLFxuICAgIHByb2plY3RSb290LFxuICAgIHNwZWNQYXR0ZXJuLFxuICAgIGNvbmZpZ1NwZWNQYXR0ZXJuLFxuICAgIGV4Y2x1ZGVTcGVjUGF0dGVybixcbiAgICBhZGRpdGlvbmFsSWdub3JlUGF0dGVybixcbiAgfSk7XG5cbiAgaWYgKCFzcGVjUGF0dGVybiB8fCAhY29uZmlnU3BlY1BhdHRlcm4pIHtcbiAgICB0aHJvdyBFcnJvcihcIkNvdWxkIG5vdCBmaW5kIGdsb2IgcGF0dGVybnMgZm9yIGV4cGxvcmluZyBzcGVjc1wiKTtcbiAgfVxuXG4gIGxldCBzcGVjQWJzb2x1dGVQYXRocyA9IGF3YWl0IGdldEZpbGVzQnlHbG9iKHByb2plY3RSb290LCBzcGVjUGF0dGVybiwge1xuICAgIGFic29sdXRlOiB0cnVlLFxuICAgIGlnbm9yZTogWy4uLmV4Y2x1ZGVTcGVjUGF0dGVybiwgLi4uYWRkaXRpb25hbElnbm9yZVBhdHRlcm5dLFxuICB9KTtcblxuICAvLyBJZiB0aGUgc3BlY1BhdHRlcm4gYW5kIGNvbmZpZ1NwZWNQYXR0ZXJuIGFyZSBkaWZmZXJlbnQsXG4gIC8vIGl0IG1lYW5zIHRoZSB1c2VyIHBhc3NlZCBzb21ldGhpbmcgbm9uLWRlZmF1bHQgdmlhIC0tc3BlYyAocnVuIG1vZGUgb25seSlcbiAgLy8gaW4gdGhpcyBzY2VuYXJpbywgd2Ugd2FudCB0byBncmFiIGV2ZXJ5dGhpbmcgdGhhdCBtYXRjaGVzIGAtLXNwZWNgXG4gIC8vIHRoYXQgZmFsbHMgd2l0aGluIHRoZWlyIGRlZmF1bHQgc3BlY1BhdHRlcm4uIFRoZSByZWFzb24gaXMgc28gd2UgYXZvaWRcbiAgLy8gYXR0ZW1wdGluZyB0byBydW4gdGhpbmdzIHRoYXQgYXJlIG5vdCBzcGVjcywgZWcgc291cmNlIGNvZGUsIHZpZGVvcywgZXRjLlxuICAvL1xuICAvLyBFeGFtcGxlOiBkZXZlbG9wZXIgd2FudHMgdG8gcnVuIHRlc3RzIGFzc29jaWF0ZWQgd2l0aCB0aW1lcnMgaW4gcGFja2FnZXMvZHJpdmVyXG4gIC8vIFNvIHRoZXkgcnVuIHlhcm4gY3lwcmVzczpydW4gLS1zcGVjICoqL3RpbWVycypcbiAgLy8gd2UgZG8gKipub3QqKiB3YW50IHRvIGNhcHR1cmUgYHRpbWVycy50c2AgKHNvdXJjZSBjb2RlKSBvciBhIHZpZGVvIGluXG4gIC8vIGN5cHJlc3MvdmlkZW9zL3RpbWVycy5jeS50cy5tcDQsIHNvIHdlIHRha2UgdGhlIGludGVyc2VjdGlvbiBiZXR3ZWVuIHNwZWNQYXR0ZXJuXG4gIC8vIGFuZCAtLXNwZWMuXG4gIGlmICghXy5pc0VxdWFsKHNwZWNQYXR0ZXJuLCBjb25maWdTcGVjUGF0dGVybikpIHtcbiAgICBjb25zdCBkZWZhdWx0U3BlY0Fic29sdXRlUGF0aHMgPSBhd2FpdCBnZXRGaWxlc0J5R2xvYihcbiAgICAgIHByb2plY3RSb290LFxuICAgICAgY29uZmlnU3BlY1BhdHRlcm4sXG4gICAgICB7XG4gICAgICAgIGFic29sdXRlOiB0cnVlLFxuICAgICAgICBpZ25vcmU6IFsuLi5leGNsdWRlU3BlY1BhdHRlcm4sIC4uLmFkZGl0aW9uYWxJZ25vcmVQYXR0ZXJuXSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgc3BlY0Fic29sdXRlUGF0aHMgPSBfLmludGVyc2VjdGlvbihcbiAgICAgIHNwZWNBYnNvbHV0ZVBhdGhzLFxuICAgICAgZGVmYXVsdFNwZWNBYnNvbHV0ZVBhdGhzXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiBtYXRjaGVkU3BlY3Moe1xuICAgIHByb2plY3RSb290LFxuICAgIHRlc3RpbmdUeXBlLFxuICAgIHNwZWNBYnNvbHV0ZVBhdGhzLFxuICAgIHNwZWNQYXR0ZXJuLFxuICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0RmlsZXNCeUdsb2IoXG4gIHByb2plY3RSb290OiBzdHJpbmcsXG4gIGdsb2I6IEdsb2JQYXR0ZXJuLFxuICBnbG9iT3B0aW9uczogR2xvYmJ5T3B0aW9uc1xuKSB7XG4gIGNvbnN0IHdvcmtpbmdEaXJlY3RvcnlQcmVmaXggPSBwYXRoLmpvaW4ocHJvamVjdFJvb3QsIHBhdGguc2VwKTtcbiAgY29uc3QgZ2xvYnMgPSAoW10gYXMgc3RyaW5nW10pXG4gICAgLmNvbmNhdChnbG9iKVxuICAgIC5tYXAoKGdsb2JQYXR0ZXJuKSA9PlxuICAgICAgZ2xvYlBhdHRlcm4uc3RhcnRzV2l0aChcIi4vXCIpID8gZ2xvYlBhdHRlcm4ucmVwbGFjZShcIi4vXCIsIFwiXCIpIDogZ2xvYlBhdHRlcm5cbiAgICApXG4gICAgLm1hcCgoZ2xvYlBhdHRlcm4pID0+IHtcbiAgICAgIC8vIElmIHRoZSBwYXR0ZXJuIGluY2x1ZGVzIHRoZSB3b3JraW5nIGRpcmVjdG9yeSwgd2Ugc3RyaXAgaXQgZnJvbSB0aGUgcGF0dGVybi5cbiAgICAgIC8vIFRoZSB3b3JraW5nIGRpcmVjdG9yeSBwYXRoIG1heSBpbmNsdWRlIGNoYXJhY3RlcnMgdGhhdCBjb25mbGljdCB3aXRoIGdsb2JcbiAgICAgIC8vIHN5bnRheCAoYnJhY2tldHMsIHBhcmVudGhlc2VzLCBldGMuKSBhbmQgY2F1c2Ugb3VyIHNlYXJjaGVzIHRvIGluYWR2ZXJ0ZW50bHkgZmFpbC5cbiAgICAgIC8vIFdlIHNjb3BlIG91ciBzZWFyY2ggdG8gdGhlIHdvcmtpbmcgZGlyZWN0b3J5IHVzaW5nIHRoZSBgY3dkYCBnbG9iYnkgb3B0aW9uLlxuICAgICAgaWYgKGdsb2JQYXR0ZXJuLnN0YXJ0c1dpdGgod29ya2luZ0RpcmVjdG9yeVByZWZpeCkpIHtcbiAgICAgICAgcmV0dXJuIGdsb2JQYXR0ZXJuLnJlcGxhY2Uod29ya2luZ0RpcmVjdG9yeVByZWZpeCwgXCJcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBnbG9iUGF0dGVybjtcbiAgICB9KTtcblxuICBpZiAob3MucGxhdGZvcm0oKSA9PT0gXCJ3aW4zMlwiKSB7XG4gICAgLy8gZ2xvYmJ5IGNhbid0IHdvcmsgd2l0aCBiYWNrd2FyZHMgc2xhc2hlc1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvZ2xvYmJ5L2lzc3Vlcy8xNzlcbiAgICBkZWJ1ZyhcInVwZGF0aW5nIGdsb2IgcGF0dGVybnMgdG8gUE9TSVhcIik7XG4gICAgZm9yIChjb25zdCBpIGluIGdsb2JzKSB7XG4gICAgICBjb25zdCBjdXIgPSBnbG9ic1tpXTtcblxuICAgICAgaWYgKCFjdXIpIHRocm93IG5ldyBFcnJvcihcInVuZGVmaW5lZCBnbG9iIHJlY2VpdmVkXCIpO1xuXG4gICAgICBnbG9ic1tpXSA9IHRvUG9zaXgoY3VyKTtcbiAgICB9XG4gIH1cblxuICB0cnkge1xuICAgIGRlYnVnKFwiZ2xvYmJpbmcgcGF0dGVybihzKTogJW9cIiwgZ2xvYnMpO1xuICAgIGRlYnVnKFwid2l0aGluIGRpcmVjdG9yeTogJXNcIiwgcHJvamVjdFJvb3QpO1xuXG4gICAgcmV0dXJuIG1hdGNoR2xvYnMoZ2xvYnMsIHtcbiAgICAgIG9ubHlGaWxlczogdHJ1ZSxcbiAgICAgIGFic29sdXRlOiB0cnVlLFxuICAgICAgY3dkOiBwcm9qZWN0Um9vdCxcbiAgICAgIC4uLmdsb2JPcHRpb25zLFxuICAgICAgaWdub3JlOiAoZ2xvYk9wdGlvbnM/Lmlnbm9yZSA/PyBbXSkuY29uY2F0KFwiKiovbm9kZV9tb2R1bGVzLyoqXCIpLFxuICAgIH0pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZGVidWcoXCJlcnJvciBpbiBnZXRGaWxlc0J5R2xvYiAlb1wiLCBlKTtcbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxuY29uc3QgbWF0Y2hHbG9icyA9IGFzeW5jIChnbG9iczogR2xvYlBhdHRlcm4sIGdsb2JieU9wdGlvbnM6IEdsb2JieU9wdGlvbnMpID0+IHtcbiAgcmV0dXJuIGF3YWl0IGdsb2JieShnbG9icywgZ2xvYmJ5T3B0aW9ucyk7XG59O1xuXG5pbnRlcmZhY2UgTWF0Y2hlZFNwZWNzIHtcbiAgcHJvamVjdFJvb3Q6IHN0cmluZztcbiAgdGVzdGluZ1R5cGU6IFRlc3RpbmdUeXBlO1xuICBzcGVjQWJzb2x1dGVQYXRoczogc3RyaW5nW107XG4gIHNwZWNQYXR0ZXJuOiBzdHJpbmcgfCBzdHJpbmdbXTtcbn1cblxuZnVuY3Rpb24gbWF0Y2hlZFNwZWNzKHtcbiAgcHJvamVjdFJvb3QsXG4gIHRlc3RpbmdUeXBlLFxuICBzcGVjQWJzb2x1dGVQYXRocyxcbn06IE1hdGNoZWRTcGVjcykge1xuICBkZWJ1ZyhcImZvdW5kIHNwZWNzICVvXCIsIHNwZWNBYnNvbHV0ZVBhdGhzKTtcblxuICBsZXQgY29tbW9uUm9vdCA9IFwiXCI7XG5cbiAgaWYgKHNwZWNBYnNvbHV0ZVBhdGhzLmxlbmd0aCA9PT0gMSkge1xuICAgIGNvbW1vblJvb3QgPSBwYXRoLmRpcm5hbWUoc3BlY0Fic29sdXRlUGF0aHNbMF0pO1xuICB9IGVsc2Uge1xuICAgIGNvbW1vblJvb3QgPSBjb21tb25QYXRoUHJlZml4KHNwZWNBYnNvbHV0ZVBhdGhzKTtcbiAgfVxuXG4gIHJldHVybiBzcGVjQWJzb2x1dGVQYXRocy5tYXAoKGFic29sdXRlKSA9PlxuICAgIHRyYW5zZm9ybVNwZWMoe1xuICAgICAgcHJvamVjdFJvb3QsXG4gICAgICBhYnNvbHV0ZSxcbiAgICAgIHRlc3RpbmdUeXBlLFxuICAgICAgY29tbW9uUm9vdCxcbiAgICAgIHBsYXRmb3JtOiBvcy5wbGF0Zm9ybSgpLFxuICAgICAgc2VwOiBwYXRoLnNlcCxcbiAgICB9KVxuICApO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zZm9ybVNwZWMge1xuICBwcm9qZWN0Um9vdDogc3RyaW5nO1xuICBhYnNvbHV0ZTogc3RyaW5nO1xuICB0ZXN0aW5nVHlwZTogVGVzdGluZ1R5cGU7XG4gIGNvbW1vblJvb3Q6IHN0cmluZztcbiAgcGxhdGZvcm06IE5vZGVKUy5QbGF0Zm9ybTtcbiAgc2VwOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVNwZWMoe1xuICBwcm9qZWN0Um9vdCxcbiAgYWJzb2x1dGUsXG4gIHRlc3RpbmdUeXBlLFxuICBjb21tb25Sb290LFxuICBwbGF0Zm9ybSxcbiAgc2VwLFxufTogVHJhbnNmb3JtU3BlYykge1xuICBpZiAocGxhdGZvcm0gPT09IFwid2luMzJcIikge1xuICAgIGFic29sdXRlID0gdG9Qb3NpeChhYnNvbHV0ZSwgc2VwKTtcbiAgICBwcm9qZWN0Um9vdCA9IHRvUG9zaXgocHJvamVjdFJvb3QsIHNlcCk7XG4gIH1cblxuICBjb25zdCByZWxhdGl2ZSA9IHBhdGgucmVsYXRpdmUocHJvamVjdFJvb3QsIGFic29sdXRlKTtcbiAgY29uc3QgcGFyc2VkRmlsZSA9IHBhdGgucGFyc2UoYWJzb2x1dGUpO1xuICBjb25zdCBmaWxlRXh0ZW5zaW9uID0gcGF0aC5leHRuYW1lKGFic29sdXRlKTtcblxuICBjb25zdCBzcGVjRmlsZUV4dGVuc2lvbiA9XG4gICAgW1wiLnNwZWNcIiwgXCIudGVzdFwiLCBcIi1zcGVjXCIsIFwiLXRlc3RcIiwgXCIuY3lcIl1cbiAgICAgIC5tYXAoKGV4dCkgPT4gZXh0ICsgZmlsZUV4dGVuc2lvbilcbiAgICAgIC5maW5kKChleHQpID0+IGFic29sdXRlLmVuZHNXaXRoKGV4dCkpIHx8IGZpbGVFeHRlbnNpb247XG5cbiAgY29uc3QgcGFydHMgPSBhYnNvbHV0ZS5zcGxpdChwcm9qZWN0Um9vdCk7XG4gIGxldCBuYW1lID0gcGFydHNbcGFydHMubGVuZ3RoIC0gMV0gfHwgXCJcIjtcblxuICBpZiAobmFtZS5zdGFydHNXaXRoKFwiL1wiKSkge1xuICAgIG5hbWUgPSBuYW1lLnNsaWNlKDEpO1xuICB9XG5cbiAgY29uc3QgTEVBRElOR19TTEFTSCA9IC9eXFwvfC9nO1xuICBjb25zdCByZWxhdGl2ZVRvQ29tbW9uUm9vdCA9IGFic29sdXRlXG4gICAgLnJlcGxhY2UoY29tbW9uUm9vdCwgXCJcIilcbiAgICAucmVwbGFjZShMRUFESU5HX1NMQVNILCBcIlwiKTtcblxuICByZXR1cm4ge1xuICAgIGZpbGVFeHRlbnNpb24sXG4gICAgYmFzZU5hbWU6IHBhcnNlZEZpbGUuYmFzZSxcbiAgICBmaWxlTmFtZTogcGFyc2VkRmlsZS5iYXNlLnJlcGxhY2Uoc3BlY0ZpbGVFeHRlbnNpb24sIFwiXCIpLFxuICAgIHNwZWNGaWxlRXh0ZW5zaW9uLFxuICAgIHJlbGF0aXZlVG9Db21tb25Sb290LFxuICAgIHNwZWNUeXBlOiAodGVzdGluZ1R5cGUgPT09IFwiY29tcG9uZW50XCJcbiAgICAgID8gXCJjb21wb25lbnRcIlxuICAgICAgOiBcImludGVncmF0aW9uXCIpIGFzIFNwZWNUeXBlLFxuICAgIG5hbWUsXG4gICAgcmVsYXRpdmUsXG4gICAgYWJzb2x1dGUsXG4gIH07XG59XG4iLCAiaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHRvQXJyYXkodmFsPzogc3RyaW5nIHwgc3RyaW5nW10pIHtcbiAgcmV0dXJuIHZhbCA/ICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiID8gW3ZhbF0gOiB2YWwpIDogW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1Bvc2l4KGZpbGU6IHN0cmluZywgc2VwOiBzdHJpbmcgPSBwYXRoLnNlcCkge1xuICByZXR1cm4gZmlsZS5zcGxpdChzZXApLmpvaW4ocGF0aC5wb3NpeC5zZXApO1xufVxuIiwgImltcG9ydCB7XG4gIEN1cnJlbnRzUnVuUGFyYW1ldGVycyxcbiAgVmFsaWRhdGVkQ3VycmVudHNQYXJhbWV0ZXJzLFxufSBmcm9tIFwiY3lwcmVzcy1jbG91ZC90eXBlc1wiO1xuaW1wb3J0IHsgTWVyZ2VkQ29uZmlnIH0gZnJvbSBcIi4uL2NvbmZpZy9jb25maWdcIjtcbmltcG9ydCB7IHdhcm4gfSBmcm9tIFwiLi4vbG9nXCI7XG5pbXBvcnQgeyBmaW5kU3BlY3MgfSBmcm9tIFwiLi9zcGVjTWF0Y2hlclwiO1xuXG5leHBvcnQgY29uc3QgZ2V0U3BlY0ZpbGVzID0gYXN5bmMgKHtcbiAgY29uZmlnLFxuICBwYXJhbXMsXG59OiB7XG4gIGNvbmZpZzogTWVyZ2VkQ29uZmlnO1xuICBwYXJhbXM6IFZhbGlkYXRlZEN1cnJlbnRzUGFyYW1ldGVycztcbn0pID0+IHtcbiAgY29uc3Qgc3BlY1BhdHRlcm4gPSBnZXRTcGVjUGF0dGVybihjb25maWcuc3BlY1BhdHRlcm4sIHBhcmFtcy5zcGVjKTtcbiAgLy8gZmluZCB0aGUgc3BlYyBmaWxlcyBhY2NvcmRpbmcgdG8gdGhlIHJlc29sdmVkIGNvbmZpZ3VyYXRpb25cbiAgY29uc3Qgc3BlY3MgPSBhd2FpdCBmaW5kU3BlY3Moe1xuICAgIC8vIGh0dHBzOi8vZG9jcy5jeXByZXNzLmlvL2d1aWRlcy9ndWlkZXMvY29tbWFuZC1saW5lI2N5cHJlc3MtcnVuLXNwZWMtbHQtc3BlYy1ndFxuICAgIHByb2plY3RSb290OiBwYXJhbXMucHJvamVjdCA/PyBjb25maWcucHJvamVjdFJvb3QsXG4gICAgdGVzdGluZ1R5cGU6IHBhcmFtcy50ZXN0aW5nVHlwZSxcbiAgICBzcGVjUGF0dGVybixcbiAgICBjb25maWdTcGVjUGF0dGVybjogY29uZmlnLnNwZWNQYXR0ZXJuLFxuICAgIGV4Y2x1ZGVTcGVjUGF0dGVybjogY29uZmlnLmV4Y2x1ZGVTcGVjUGF0dGVybixcbiAgICBhZGRpdGlvbmFsSWdub3JlUGF0dGVybjogY29uZmlnLmFkZGl0aW9uYWxJZ25vcmVQYXR0ZXJuLFxuICB9KTtcbiAgaWYgKHNwZWNzLmxlbmd0aCA9PT0gMCkge1xuICAgIHdhcm4oXG4gICAgICBcIkZvdW5kIG5vIHNwZWMgZmlsZXMuIFdhcyBsb29raW5nIGZvciBzcGVjIGZpbGVzIHRoYXQgbWF0Y2ggYm90aCBjb25maWdTcGVjUGF0dGVybiBhbmQgc3BlY1BhdHRlcm4gcmVsYXRpdmUgdG8gcHJvamVjdFJvb3QuIENvbmZpZ3VyYXRpb246ICVPXCIsXG4gICAgICB7XG4gICAgICAgIHByb2plY3RSb290OiBjb25maWcucHJvamVjdFJvb3QsXG4gICAgICAgIHNwZWNQYXR0ZXJuLFxuICAgICAgICBjb25maWdTcGVjUGF0dGVybjogY29uZmlnLnNwZWNQYXR0ZXJuLFxuICAgICAgICBleGNsdWRlU3BlY1BhdHRlcm46IFtcbiAgICAgICAgICBjb25maWcuZXhjbHVkZVNwZWNQYXR0ZXJuLFxuICAgICAgICAgIGNvbmZpZy5hZGRpdGlvbmFsSWdub3JlUGF0dGVybixcbiAgICAgICAgXS5mbGF0KDIpLFxuICAgICAgICB0ZXN0aW5nVHlwZTogcGFyYW1zLnRlc3RpbmdUeXBlLFxuICAgICAgfVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHsgc3BlY3MsIHNwZWNQYXR0ZXJuIH07XG59O1xuXG5mdW5jdGlvbiBnZXRTcGVjUGF0dGVybihcbiAgY29uZmlnUGF0dGVybjogTWVyZ2VkQ29uZmlnW1wic3BlY1BhdHRlcm5cIl0sXG4gIGV4cGxpY2l0PzogQ3VycmVudHNSdW5QYXJhbWV0ZXJzW1wic3BlY1wiXVxuKSB7XG4gIHJldHVybiBleHBsaWNpdCB8fCBjb25maWdQYXR0ZXJuO1xufVxuIiwgImV4cG9ydCBjbGFzcyBDb25maWdTdGF0ZSB7XG4gIHByaXZhdGUgX2NvbmZpZzogQ3lwcmVzcy5SZXNvbHZlZENvbmZpZ09wdGlvbnMgfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gIHB1YmxpYyBzZXRDb25maWcoYzogdHlwZW9mIHRoaXMuX2NvbmZpZykge1xuICAgIHRoaXMuX2NvbmZpZyA9IGM7XG4gIH1cbiAgcHVibGljIGdldENvbmZpZygpIHtcbiAgICByZXR1cm4gdGhpcy5fY29uZmlnO1xuICB9XG59XG4iLCAiLyoqXG4gKiBNYXAgTW9kdWxlIEFQSSByZXN1bHRzIHRvIGFmdGVyOnNwZWMgcmVzdWx0c1xuICovXG5cbmltcG9ydCB7IFN0YW5kYXJkIH0gZnJvbSBcIi4uL2N5cHJlc3MudHlwZXNcIjtcbmltcG9ydCB7IENvbmZpZ1N0YXRlIH0gZnJvbSBcIi4uL3N0YXRlXCI7XG5cbmV4cG9ydCBjbGFzcyBTcGVjQWZ0ZXJUb01vZHVsZUFQSU1hcHBlciB7XG4gIHN0YXRpYyBnZXRUZXN0QXR0ZW1wdChcbiAgICBhdHRlbXB0OiBTdGFuZGFyZC5TcGVjQWZ0ZXIuVGVzdEF0dGVtcHQsXG4gICAgc2NyZWVuc2hvdHM6IFN0YW5kYXJkLlNwZWNBZnRlci5QYXlsb2FkW1wic2NyZWVuc2hvdHNcIl1cbiAgKTogU3RhbmRhcmQuTW9kdWxlQVBJLlRlc3RBdHRlbXB0IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uYXR0ZW1wdCxcbiAgICAgIGR1cmF0aW9uOiBhdHRlbXB0LndhbGxDbG9ja0R1cmF0aW9uLFxuICAgICAgc3RhcnRlZEF0OiBhdHRlbXB0LndhbGxDbG9ja1N0YXJ0ZWRBdCxcbiAgICAgIHNjcmVlbnNob3RzLFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZ2V0VGVzdChcbiAgICB0OiBTdGFuZGFyZC5TcGVjQWZ0ZXIuVGVzdCxcbiAgICBzY3JlZW5zaG90czogU3RhbmRhcmQuU3BlY0FmdGVyLlBheWxvYWRbXCJzY3JlZW5zaG90c1wiXVxuICApOiBTdGFuZGFyZC5Nb2R1bGVBUEkuVGVzdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLnQsXG4gICAgICBhdHRlbXB0czogdC5hdHRlbXB0cy5tYXAoKGEsIGkpID0+XG4gICAgICAgIFNwZWNBZnRlclRvTW9kdWxlQVBJTWFwcGVyLmdldFRlc3RBdHRlbXB0KFxuICAgICAgICAgIGEsXG4gICAgICAgICAgc2NyZWVuc2hvdHMuZmlsdGVyKFxuICAgICAgICAgICAgKHMpID0+IHMudGVzdElkID09PSB0LnRlc3RJZCAmJiBzLnRlc3RBdHRlbXB0SW5kZXggPT09IGlcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICksXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBjb252ZXJ0KFxuICAgIHNwZWNBZnRlclJlc3VsdDogU3RhbmRhcmQuU3BlY0FmdGVyLlBheWxvYWQsXG4gICAgY29uZmlnU3RhdGU6IENvbmZpZ1N0YXRlXG4gICk6IFN0YW5kYXJkLk1vZHVsZUFQSS5Db21wbGV0ZWRSZXN1bHQge1xuICAgIGNvbnN0IHN0YXRzID0ge1xuICAgICAgZHVyYXRpb246IHNwZWNBZnRlclJlc3VsdC5zdGF0cy53YWxsQ2xvY2tEdXJhdGlvbixcbiAgICAgIGVuZGVkQXQ6IHNwZWNBZnRlclJlc3VsdC5zdGF0cy53YWxsQ2xvY2tFbmRlZEF0LFxuICAgICAgc3RhcnRlZEF0OiBzcGVjQWZ0ZXJSZXN1bHQuc3RhdHMud2FsbENsb2NrU3RhcnRlZEF0LFxuICAgICAgZmFpbHVyZXM6IHNwZWNBZnRlclJlc3VsdC5zdGF0cy5mYWlsdXJlcyA/PyAwLFxuICAgICAgcGFzc2VzOiBzcGVjQWZ0ZXJSZXN1bHQuc3RhdHMucGFzc2VzID8/IDAsXG4gICAgICBwZW5kaW5nOiBzcGVjQWZ0ZXJSZXN1bHQuc3RhdHMucGVuZGluZyA/PyAwLFxuICAgICAgc2tpcHBlZDogc3BlY0FmdGVyUmVzdWx0LnN0YXRzLnNraXBwZWQgPz8gMCxcbiAgICAgIHN1aXRlczogc3BlY0FmdGVyUmVzdWx0LnN0YXRzLnN1aXRlcyA/PyAwLFxuICAgICAgdGVzdHM6IHNwZWNBZnRlclJlc3VsdC5zdGF0cy50ZXN0cyA/PyAwLFxuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1czogXCJmaW5pc2hlZFwiLFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgY29uZmlnOiBjb25maWdTdGF0ZS5nZXRDb25maWcoKSxcbiAgICAgIHRvdGFsRHVyYXRpb246IHN0YXRzLmR1cmF0aW9uLFxuICAgICAgdG90YWxTdWl0ZXM6IHN0YXRzLnN1aXRlcyxcbiAgICAgIHRvdGFsVGVzdHM6IHN0YXRzLnRlc3RzLFxuICAgICAgdG90YWxGYWlsZWQ6IHN0YXRzLmZhaWx1cmVzLFxuICAgICAgdG90YWxQYXNzZWQ6IHN0YXRzLnBhc3NlcyxcbiAgICAgIHRvdGFsUGVuZGluZzogc3RhdHMucGVuZGluZyxcbiAgICAgIHRvdGFsU2tpcHBlZDogc3RhdHMuc2tpcHBlZCA/PyAwLFxuICAgICAgc3RhcnRlZFRlc3RzQXQ6IHN0YXRzLnN0YXJ0ZWRBdCxcbiAgICAgIGVuZGVkVGVzdHNBdDogc3RhdHMuZW5kZWRBdCxcbiAgICAgIHJ1bnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHN0YXRzLFxuICAgICAgICAgIHJlcG9ydGVyOiBzcGVjQWZ0ZXJSZXN1bHQucmVwb3J0ZXIsXG4gICAgICAgICAgcmVwb3J0ZXJTdGF0czogc3BlY0FmdGVyUmVzdWx0LnJlcG9ydGVyU3RhdHMgPz8gbnVsbCxcbiAgICAgICAgICBzcGVjOiBzcGVjQWZ0ZXJSZXN1bHQuc3BlYyxcbiAgICAgICAgICBlcnJvcjogc3BlY0FmdGVyUmVzdWx0LmVycm9yLFxuICAgICAgICAgIHZpZGVvOiBzcGVjQWZ0ZXJSZXN1bHQudmlkZW8sXG4gICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgIHNob3VsZFVwbG9hZFZpZGVvOiB0cnVlLCAvLyBub3QgcmVhbGx5IHVzZWRcbiAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgLy8gd3JvbmcgdHlwZWRlZiBmb3IgQ3lwcmVzc0NvbW1hbmRMaW5lLkN5cHJlc3NSdW5SZXN1bHRcbiAgICAgICAgICAvLyBhY3R1YWwgSG9va05hbWUgaXMgXCJiZWZvcmUgYWxsXCIgfCBcImJlZm9yZSBlYWNoXCIgfCBcImFmdGVyIGFsbFwiIHwgXCJhZnRlciBlYWNoXCJcbiAgICAgICAgICBob29rczogc3BlY0FmdGVyUmVzdWx0Lmhvb2tzLFxuICAgICAgICAgIHRlc3RzOiAoc3BlY0FmdGVyUmVzdWx0LnRlc3RzID8/IFtdKS5tYXAoKHQpID0+XG4gICAgICAgICAgICBTcGVjQWZ0ZXJUb01vZHVsZUFQSU1hcHBlci5nZXRUZXN0KHQsIHNwZWNBZnRlclJlc3VsdC5zY3JlZW5zaG90cylcbiAgICAgICAgICApLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGJhY2tmaWxsRXhjZXB0aW9uKFxuICAgIHJlc3VsdDogU3RhbmRhcmQuTW9kdWxlQVBJLkNvbXBsZXRlZFJlc3VsdFxuICApOiBTdGFuZGFyZC5Nb2R1bGVBUEkuQ29tcGxldGVkUmVzdWx0IHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ucmVzdWx0LFxuICAgICAgcnVuczogcmVzdWx0LnJ1bnMubWFwKFNwZWNBZnRlclRvTW9kdWxlQVBJTWFwcGVyLmJhY2tmaWxsRXhjZXB0aW9uUnVuKSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGJhY2tmaWxsRXhjZXB0aW9uUnVuKHJ1bjogU3RhbmRhcmQuTW9kdWxlQVBJLlJ1bikge1xuICAgIGlmICghcnVuLmVycm9yKSB7XG4gICAgICByZXR1cm4gcnVuO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAuLi5ydW4sXG4gICAgICB0ZXN0czogW2dldEZha2VUZXN0RnJvbUV4Y2VwdGlvbihydW4uZXJyb3IsIHJ1bi5zdGF0cyldLFxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBmYWtlIHRlc3QgaXRlbSBmcm9tIGFuIGV4Y2VwdGlvblxuICpcbiAqIEBwYXJhbSBlcnJvclxuICogQHBhcmFtIHN0YXRzXG4gKiBAcmV0dXJuc1xuICovXG5mdW5jdGlvbiBnZXRGYWtlVGVzdEZyb21FeGNlcHRpb24oXG4gIGVycm9yOiBzdHJpbmcsXG4gIHN0YXRzOiBTdGFuZGFyZC5Nb2R1bGVBUEkuUnVuW1wic3RhdHNcIl1cbik6IFN0YW5kYXJkLk1vZHVsZUFQSS5UZXN0IHtcbiAgcmV0dXJuIHtcbiAgICB0aXRsZTogW1wiVW5rbm93blwiXSxcbiAgICBib2R5OiBcIlwiLFxuICAgIGRpc3BsYXlFcnJvcjogZXJyb3Iuc3BsaXQoXCJcXG5cIilbMF0sXG4gICAgc3RhdGU6IFwiZmFpbGVkXCIsXG4gICAgYXR0ZW1wdHM6IFtcbiAgICAgIHtcbiAgICAgICAgc3RhdGU6IFwiZmFpbGVkXCIsXG4gICAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgICBlcnJvcjoge1xuICAgICAgICAgIG5hbWU6IFwiRXJyb3JcIixcbiAgICAgICAgICBtZXNzYWdlOiBlcnJvci5zcGxpdChcIlxcblwiKVswXSxcbiAgICAgICAgICBzdGFjazogZXJyb3IsXG4gICAgICAgICAgY29kZUZyYW1lOiBudWxsLFxuICAgICAgICB9LFxuICAgICAgICBzY3JlZW5zaG90czogW10sXG4gICAgICAgIHN0YXJ0ZWRBdDogc3RhdHMuc3RhcnRlZEF0LFxuICAgICAgICB2aWRlb1RpbWVzdGFtcDogMCxcbiAgICAgIH0sXG4gICAgXSxcbiAgfTtcbn1cbiIsICJpbXBvcnQgeyBJbnN0YW5jZUlkIH0gZnJvbSBcImN5cHJlc3MtY2xvdWQvdHlwZXNcIjtcbmltcG9ydCB7IGVycm9yLCB3YXJuIH0gZnJvbSBcIi4uL2xvZ1wiO1xuaW1wb3J0IHsgZ2V0RmFpbGVkRmFrZUluc3RhbmNlUmVzdWx0IH0gZnJvbSBcIi4uL3Jlc3VsdHMvZW1wdHlcIjtcbmltcG9ydCB7IFNwZWNBZnRlclRvTW9kdWxlQVBJTWFwcGVyIH0gZnJvbSBcIi4uL3Jlc3VsdHMvbWFwUmVzdWx0XCI7XG5cbmltcG9ydCBEZWJ1ZyBmcm9tIFwiZGVidWdcIjtcbmltcG9ydCB7IEN5cHJlc3NUeXBlcywgU3RhbmRhcmQgfSBmcm9tIFwiLi4vY3lwcmVzcy50eXBlc1wiO1xuaW1wb3J0IHsgQ29uZmlnU3RhdGUgfSBmcm9tIFwiLi9jb25maWdcIjtcbmNvbnN0IGRlYnVnID0gRGVidWcoXCJjdXJyZW50czpzdGF0ZVwiKTtcblxudHlwZSBJbnN0YW5jZUV4ZWN1dGlvblN0YXRlID0ge1xuICBpbnN0YW5jZUlkOiBJbnN0YW5jZUlkO1xuICBzcGVjOiBzdHJpbmc7XG4gIG91dHB1dD86IHN0cmluZztcbiAgc3BlY0JlZm9yZT86IERhdGU7XG4gIGNyZWF0ZWRBdDogRGF0ZTtcbiAgcnVuUmVzdWx0cz86IFN0YW5kYXJkLk1vZHVsZUFQSS5Db21wbGV0ZWRSZXN1bHQ7XG4gIHJ1blJlc3VsdHNSZXBvcnRlZEF0PzogRGF0ZTtcbiAgc3BlY0FmdGVyPzogRGF0ZTtcbiAgc3BlY0FmdGVyUmVzdWx0cz86IFN0YW5kYXJkLlNwZWNBZnRlci5QYXlsb2FkO1xuICByZXBvcnRTdGFydGVkQXQ/OiBEYXRlO1xuICBjb3ZlcmFnZUZpbGVQYXRoPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgRXhlY3V0aW9uU3RhdGVTY3JlZW5zaG90ID1cbiAgQ3lwcmVzc1R5cGVzLkV2ZW50UGF5bG9hZC5TY3JlZW5zaG90QWZ0ZXIgJiB7XG4gICAgdGVzdElkPzogc3RyaW5nO1xuICAgIHRlc3RBdHRlbXB0SW5kZXg6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICB9O1xuZXhwb3J0IHR5cGUgRXhlY3V0aW9uU3RhdGVUZXN0QXR0ZW1wdCA9IEN5cHJlc3NUeXBlcy5FdmVudFBheWxvYWQuVGVzdEFmdGVyO1xuXG5leHBvcnQgY2xhc3MgRXhlY3V0aW9uU3RhdGUge1xuICBwcml2YXRlIHdhcm5pbmdzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcbiAgcHJpdmF0ZSBhdHRlbXB0c0RhdGE6IEV4ZWN1dGlvblN0YXRlVGVzdEF0dGVtcHRbXSA9IFtdO1xuICBwcml2YXRlIHNjcmVlbnNob3RzRGF0YTogRXhlY3V0aW9uU3RhdGVTY3JlZW5zaG90W10gPSBbXTtcbiAgcHJpdmF0ZSBjdXJyZW50VGVzdElEPzogc3RyaW5nO1xuICBwcml2YXRlIHN0YXRlOiBSZWNvcmQ8SW5zdGFuY2VJZCwgSW5zdGFuY2VFeGVjdXRpb25TdGF0ZT4gPSB7fTtcblxuICBwdWJsaWMgZ2V0V2FybmluZ3MoKSB7XG4gICAgcmV0dXJuIHRoaXMud2FybmluZ3M7XG4gIH1cblxuICBwdWJsaWMgYWRkV2FybmluZyh3YXJuaW5nOiBzdHJpbmcpIHtcbiAgICB0aGlzLndhcm5pbmdzLmFkZCh3YXJuaW5nKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRSZXN1bHRzKFxuICAgIGNvbmZpZ1N0YXRlOiBDb25maWdTdGF0ZVxuICApOiBTdGFuZGFyZC5Nb2R1bGVBUEkuQ29tcGxldGVkUmVzdWx0W10ge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMuc3RhdGUpLm1hcCgoaSkgPT5cbiAgICAgIHRoaXMuZ2V0SW5zdGFuY2VSZXN1bHRzKGNvbmZpZ1N0YXRlLCBpLmluc3RhbmNlSWQpXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRJbnN0YW5jZShpbnN0YW5jZUlkOiBJbnN0YW5jZUlkKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGVbaW5zdGFuY2VJZF07XG4gIH1cblxuICBwdWJsaWMgZ2V0U3BlYyhzcGVjOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh0aGlzLnN0YXRlKS5maW5kKChpKSA9PiBpLnNwZWMgPT09IHNwZWMpO1xuICB9XG5cbiAgcHVibGljIGluaXRJbnN0YW5jZSh7XG4gICAgaW5zdGFuY2VJZCxcbiAgICBzcGVjLFxuICB9OiB7XG4gICAgaW5zdGFuY2VJZDogSW5zdGFuY2VJZDtcbiAgICBzcGVjOiBzdHJpbmc7XG4gIH0pIHtcbiAgICBkZWJ1ZygnSW5pdCBleGVjdXRpb24gc3RhdGUgZm9yIFwiJXNcIicsIHNwZWMpO1xuICAgIHRoaXMuc3RhdGVbaW5zdGFuY2VJZF0gPSB7XG4gICAgICBpbnN0YW5jZUlkLFxuICAgICAgc3BlYyxcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIHNldFNwZWNCZWZvcmUoc3BlYzogc3RyaW5nKSB7XG4gICAgY29uc3QgaSA9IHRoaXMuZ2V0U3BlYyhzcGVjKTtcbiAgICBpZiAoIWkpIHtcbiAgICAgIHdhcm4oJ0Nhbm5vdCBmaW5kIGV4ZWN1dGlvbiBzdGF0ZSBmb3Igc3BlYyBcIiVzXCInLCBzcGVjKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpLnNwZWNCZWZvcmUgPSBuZXcgRGF0ZSgpO1xuICB9XG5cbiAgcHVibGljIHNldFNwZWNDb3ZlcmFnZShzcGVjOiBzdHJpbmcsIGNvdmVyYWdlRmlsZVBhdGg6IHN0cmluZykge1xuICAgIGNvbnN0IGkgPSB0aGlzLmdldFNwZWMoc3BlYyk7XG4gICAgaWYgKCFpKSB7XG4gICAgICB3YXJuKCdDYW5ub3QgZmluZCBleGVjdXRpb24gc3RhdGUgZm9yIHNwZWMgXCIlc1wiJywgc3BlYyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZGVidWcoXCJFeHBlcmltZW50YWw6IGNvdmVyYWdlRmlsZVBhdGggd2FzIHNldFwiKTtcbiAgICBpLmNvdmVyYWdlRmlsZVBhdGggPSBjb3ZlcmFnZUZpbGVQYXRoO1xuICB9XG5cbiAgcHVibGljIHNldFNwZWNBZnRlcihzcGVjOiBzdHJpbmcsIHJlc3VsdHM6IFN0YW5kYXJkLlNwZWNBZnRlci5QYXlsb2FkKSB7XG4gICAgY29uc3QgaSA9IHRoaXMuZ2V0U3BlYyhzcGVjKTtcbiAgICBpZiAoIWkpIHtcbiAgICAgIHdhcm4oJ0Nhbm5vdCBmaW5kIGV4ZWN1dGlvbiBzdGF0ZSBmb3Igc3BlYyBcIiVzXCInLCBzcGVjKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaS5zcGVjQWZ0ZXIgPSBuZXcgRGF0ZSgpO1xuICAgIGkuc3BlY0FmdGVyUmVzdWx0cyA9IHJlc3VsdHM7XG4gIH1cblxuICBwdWJsaWMgc2V0U3BlY091dHB1dChzcGVjOiBzdHJpbmcsIG91dHB1dDogc3RyaW5nKSB7XG4gICAgY29uc3QgaSA9IHRoaXMuZ2V0U3BlYyhzcGVjKTtcbiAgICBpZiAoIWkpIHtcbiAgICAgIHdhcm4oJ0Nhbm5vdCBmaW5kIGV4ZWN1dGlvbiBzdGF0ZSBmb3Igc3BlYyBcIiVzXCInLCBzcGVjKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRJbnN0YW5jZU91dHB1dChpLmluc3RhbmNlSWQsIG91dHB1dCk7XG4gIH1cblxuICBwdWJsaWMgc2V0SW5zdGFuY2VPdXRwdXQoaW5zdGFuY2VJZDogc3RyaW5nLCBvdXRwdXQ6IHN0cmluZykge1xuICAgIGNvbnN0IGkgPSB0aGlzLnN0YXRlW2luc3RhbmNlSWRdO1xuICAgIGlmICghaSkge1xuICAgICAgd2FybignQ2Fubm90IGZpbmQgZXhlY3V0aW9uIHN0YXRlIGZvciBpbnN0YW5jZSBcIiVzXCInLCBpbnN0YW5jZUlkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGkub3V0cHV0KSB7XG4gICAgICBkZWJ1ZygnSW5zdGFuY2UgXCIlc1wiIGFscmVhZHkgaGFzIG91dHB1dCcsIGluc3RhbmNlSWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpLm91dHB1dCA9IG91dHB1dDtcbiAgfVxuXG4gIHB1YmxpYyBzZXRJbnN0YW5jZVJlc3VsdChcbiAgICBpbnN0YW5jZUlkOiBzdHJpbmcsXG4gICAgcnVuUmVzdWx0czogU3RhbmRhcmQuTW9kdWxlQVBJLkNvbXBsZXRlZFJlc3VsdFxuICApIHtcbiAgICBjb25zdCBpID0gdGhpcy5zdGF0ZVtpbnN0YW5jZUlkXTtcbiAgICBpZiAoIWkpIHtcbiAgICAgIHdhcm4oJ0Nhbm5vdCBmaW5kIGV4ZWN1dGlvbiBzdGF0ZSBmb3IgaW5zdGFuY2UgXCIlc1wiJywgaW5zdGFuY2VJZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGkucnVuUmVzdWx0cyA9IHtcbiAgICAgIC4uLnJ1blJlc3VsdHMsXG4gICAgICBzdGF0dXM6IFwiZmluaXNoZWRcIixcbiAgICB9O1xuICAgIGkucnVuUmVzdWx0c1JlcG9ydGVkQXQgPSBuZXcgRGF0ZSgpO1xuICB9XG5cbiAgcHVibGljIGdldEluc3RhbmNlUmVzdWx0cyhcbiAgICBjb25maWdTdGF0ZTogQ29uZmlnU3RhdGUsXG4gICAgaW5zdGFuY2VJZDogc3RyaW5nXG4gICk6IFN0YW5kYXJkLk1vZHVsZUFQSS5Db21wbGV0ZWRSZXN1bHQge1xuICAgIGNvbnN0IGkgPSB0aGlzLmdldEluc3RhbmNlKGluc3RhbmNlSWQpO1xuXG4gICAgaWYgKCFpKSB7XG4gICAgICBlcnJvcignQ2Fubm90IGZpbmQgZXhlY3V0aW9uIHN0YXRlIGZvciBpbnN0YW5jZSBcIiVzXCInLCBpbnN0YW5jZUlkKTtcblxuICAgICAgcmV0dXJuIGdldEZhaWxlZEZha2VJbnN0YW5jZVJlc3VsdChjb25maWdTdGF0ZSwge1xuICAgICAgICBzcGVjczogW1widW5rbm93blwiXSxcbiAgICAgICAgZXJyb3I6IGBbY3VycmVudHNdIEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgY3lwcmVzcyByZXN1bHRzIGZvciBpbnN0YW5jZSAke2luc3RhbmNlSWR9LiBTZWUgdGhlIGNvbnNvbGUgb3V0cHV0IGZvciBkZXRhaWxzLmAsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyB1c2Ugc3BlYzphZnRlciByZXN1bHRzIC0gaXQgY2FuIGJlY29tZSBhdmFpbGFibGUgYmVmb3JlIHJ1biByZXN1bHRzXG4gICAgaWYgKGkuc3BlY0FmdGVyUmVzdWx0cykge1xuICAgICAgZGVidWcoJ1VzaW5nIHNwZWM6YWZ0ZXIgcmVzdWx0cyBmb3IgJXMgXCIlc1wiJywgaW5zdGFuY2VJZCwgaS5zcGVjKTtcbiAgICAgIHJldHVybiBTcGVjQWZ0ZXJUb01vZHVsZUFQSU1hcHBlci5iYWNrZmlsbEV4Y2VwdGlvbihcbiAgICAgICAgU3BlY0FmdGVyVG9Nb2R1bGVBUElNYXBwZXIuY29udmVydChpLnNwZWNBZnRlclJlc3VsdHMsIGNvbmZpZ1N0YXRlKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoaS5ydW5SZXN1bHRzKSB7XG4gICAgICBkZWJ1ZygnVXNpbmcgcnVuUmVzdWx0cyBmb3IgJXMgXCIlc1wiJywgaW5zdGFuY2VJZCwgaS5zcGVjKTtcbiAgICAgIHJldHVybiBTcGVjQWZ0ZXJUb01vZHVsZUFQSU1hcHBlci5iYWNrZmlsbEV4Y2VwdGlvbihpLnJ1blJlc3VsdHMpO1xuICAgIH1cblxuICAgIGRlYnVnKCdObyByZXN1bHRzIGRldGVjdGVkIGZvciBcIiVzXCInLCBpLnNwZWMpO1xuICAgIHJldHVybiBnZXRGYWlsZWRGYWtlSW5zdGFuY2VSZXN1bHQoY29uZmlnU3RhdGUsIHtcbiAgICAgIHNwZWNzOiBbaS5zcGVjXSxcbiAgICAgIGVycm9yOiBgTm8gcmVzdWx0cyBkZXRlY3RlZCBmb3IgdGhlIHNwZWMgZmlsZS4gVGhhdCB1c3VhbGx5IGhhcHBlbnMgYmVjYXVzZSBvZiBjeXByZXNzIGNyYXNoLiBTZWUgdGhlIGNvbnNvbGUgb3V0cHV0IGZvciBkZXRhaWxzLmAsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgYWRkQXR0ZW1wdHNEYXRhKGF0dGVtcHREZXRhaWxzOiBDeXByZXNzVHlwZXMuRXZlbnRQYXlsb2FkLlRlc3RBZnRlcikge1xuICAgIHRoaXMuYXR0ZW1wdHNEYXRhLnB1c2goYXR0ZW1wdERldGFpbHMpO1xuICB9XG5cbiAgcHVibGljIGdldEF0dGVtcHRzRGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5hdHRlbXB0c0RhdGE7XG4gIH1cblxuICBwdWJsaWMgYWRkU2NyZWVuc2hvdHNEYXRhKHNjcmVlbnNob3RzRGF0YTogRXhlY3V0aW9uU3RhdGVTY3JlZW5zaG90KSB7XG4gICAgdGhpcy5zY3JlZW5zaG90c0RhdGEucHVzaChzY3JlZW5zaG90c0RhdGEpO1xuICB9XG5cbiAgcHVibGljIGdldFNjcmVlbnNob3RzRGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5zY3JlZW5zaG90c0RhdGE7XG4gIH1cblxuICBwdWJsaWMgc2V0Q3VycmVudFRlc3RJRCh0ZXN0SUQ6IHN0cmluZykge1xuICAgIHRoaXMuY3VycmVudFRlc3RJRCA9IHRlc3RJRDtcbiAgfVxuXG4gIHB1YmxpYyBnZXRDdXJyZW50VGVzdElEKCkge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRUZXN0SUQ7XG4gIH1cbn1cbiIsICJpbXBvcnQgY2hhbGsgZnJvbSBcImNoYWxrXCI7XG5pbXBvcnQgcGx1ciBmcm9tIFwicGx1clwiO1xuaW1wb3J0IHsgd2FybiB9IGZyb20gXCIuL2xvZ1wiO1xuaW1wb3J0IHsgRXhlY3V0aW9uU3RhdGUgfSBmcm9tIFwiLi9zdGF0ZVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gcHJpbnRXYXJuaW5ncyhleGVjdXRpb25TdGF0ZTogRXhlY3V0aW9uU3RhdGUpIHtcbiAgY29uc3Qgd2FybmluZ3MgPSBBcnJheS5mcm9tKGV4ZWN1dGlvblN0YXRlLmdldFdhcm5pbmdzKCkpO1xuICBpZiAod2FybmluZ3MubGVuZ3RoID4gMCkge1xuICAgIHdhcm4oXG4gICAgICBgJHt3YXJuaW5ncy5sZW5ndGh9ICR7cGx1cihcbiAgICAgICAgXCJXYXJuaW5nXCIsXG4gICAgICAgIHdhcm5pbmdzLmxlbmd0aFxuICAgICAgKX0gZW5jb3VudGVyZWQgZHVyaW5nIHRoZSBleGVjdXRpb246XFxuJHt3YXJuaW5nc1xuICAgICAgICAubWFwKFxuICAgICAgICAgICh3LCBpKSA9PiBgXFxuJHtjaGFsay55ZWxsb3coYFske2kgKyAxfS8ke3dhcm5pbmdzLmxlbmd0aH1dYCl9ICR7d31gXG4gICAgICAgIClcbiAgICAgICAgLmpvaW4oXCJcXG5cIil9YFxuICAgICk7XG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxPQUFPOzs7QUNEUCxTQUFTLHFCQUFxQjtBQUV2QixJQUFNQSxXQUFVLGNBQWMsWUFBWSxHQUFHOzs7QUNGcEQsT0FBTyxRQUFRO0FBQ2YsSUFBTSxVQUFVLEdBQUc7QUFHbkIsR0FBRyxRQUFRLFNBQVUsU0FBUyxNQUFNLFNBQVM7QUFFM0MsTUFBSSxRQUFRLE1BQU0sU0FBUyxHQUFHO0FBRTVCLFVBQU1DLFdBQVUsUUFBUSxTQUFTLE1BQU07QUFBQSxNQUNyQyxHQUFHO0FBQUE7QUFBQSxNQUVILE9BQU8s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Q0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBO0FBQUEsSUFDRixDQUFDO0FBQUE7QUFBQSxJQUVELFdBQVcsUUFBUTtBQUFBO0FBQUEsTUFFakI7QUFBQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BQ0E7QUFBQTtBQUFBLE1BQ0E7QUFBQTtBQUFBO0FBQUEsTUFFQTtBQUFBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFDQTtBQUFBO0FBQUEsTUFDQTtBQUFBO0FBQUE7QUFBQSxNQUVBO0FBQUE7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUNBO0FBQUE7QUFBQSxNQUNBO0FBQUE7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELFVBQVU7QUFBQSxJQUNWLGdCQUFnQixRQUFRO0FBQUEsTUFDdEI7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsUUFBUSxRQUFRO0FBQUEsTUFDZDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELFNBQVM7QUFBQTtBQUFBLElBRVQsU0FBUyxRQUFRO0FBQUEsTUFDZjtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFD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QUFZO0FBQUEsSUFDdEI7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0EsYUFBYSxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUM7QUFBQSxJQUNqQyxNQUFNO0FBQUEsSUFDTjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQSxpQkFBaUI7QUFBQSxFQUNuQixDQUFDO0FBRUQsV0FBU0MsS0FBSSxLQUFLO0FBQ2xCLE9BQUssc0JBQWUsS0FBS0EsS0FBSSxNQUFNLENBQUM7QUFDcEMsbUJBQWlCO0FBRWpCLFFBQU0sU0FBUztBQUNmO0FBQUEsSUFDRTtBQUFBLElBQ0E7QUFBQSxJQUNBLE9BQU87QUFBQSxFQUNUO0FBRUEsUUFBTTtBQUFBLElBQ0o7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLE1BQ0UsT0FBT0EsS0FBSTtBQUFBLE1BQ1gsU0FBU0EsS0FBSTtBQUFBLE1BQ2IsV0FBV0EsS0FBSTtBQUFBLE1BQ2YsVUFBQUQ7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBRUEsVUFBUTtBQUVSLFFBQU0sUUFBUSxXQUFXLFdBQVc7QUFDcEMsUUFBTSxXQUFXO0FBQUEsSUFDZixlQUFlLFdBQVcsV0FBVztBQUFBLElBQ3JDO0FBQUEsRUFDRjtBQUVBLFFBQU0sU0FBUyxvQkFBb0I7QUFDbkMsVUFBUSxJQUFJLGFBQWEsUUFBUSxDQUFDO0FBRWxDLEVBQUFFLGVBQWMsY0FBYztBQUU1QixPQUFLLDZCQUFzQixLQUFLRCxLQUFJLE1BQU0sQ0FBQztBQUUzQyxRQUFNLFNBQVM7QUFFZixTQUFPO0FBRVAsU0FBTztBQUFBLElBQ0wsR0FBRztBQUFBLElBQ0gsUUFBUUEsS0FBSTtBQUFBLEVBQ2Q7QUFDRjs7O0FUcEpPLFNBQVNFLEtBQUksUUFBeUI7QUFDM0MsU0FBTyxJQUFZLE1BQU07QUFDM0I7IiwKICAibmFtZXMiOiBbInJlcXVpcmUiLCAicHJvY2VzcyIsICJFdmVudCIsICJlcnJvciIsICJEZWJ1ZyIsICJkZWJ1ZyIsICJkZWJ1ZyIsICJsb2ciLCAicmVxdWlyZSIsICJEZWJ1ZyIsICJEZWJ1ZyIsICJfIiwgIkRlYnVnIiwgIlAiLCAibWF0Y2giLCAiRGVidWciLCAicGF0aCIsICJEZWJ1ZyIsICJkZWJ1ZyIsICJtYXRjaCIsICJQIiwgIm1hdGNoIiwgIlAiLCAiZGVidWciLCAiZGVidWciLCAiRGVidWciLCAiZGVidWciLCAiRGVidWciLCAicmVxdWlyZSIsICJzdGRvdXQiLCAiXyIsICJkZWJ1ZyIsICJEZWJ1ZyIsICJtYXRjaCIsICJQIiwgIkRlYnVnIiwgIl8iLCAiZGVidWciLCAiRGVidWciLCAiXyIsICJfIiwgIl8iLCAiZGVidWciLCAiRGVidWciLCAiXyIsICJlcnJvciIsICJfIiwgIl8iLCAicGxhdGZvcm0iLCAic3Rkb3V0IiwgIl8iLCAiZGVidWciLCAiXyIsICJfIiwgImRlYnVnIiwgIkRlYnVnIiwgIl8iLCAicGFyc2VJU08iLCAibWF0Y2giLCAibWF0Y2giLCAiZXJyb3IiLCAicnVuIiwgImkiLCAicGFyc2VJU08iLCAiZGVidWciLCAiRGVidWciLCAiXyIsICJlcnJvciIsICJEZWJ1ZyIsICJEZWJ1ZyIsICJmcyIsICJqb2luIiwgInBhdGgiLCAiZXJyb3IiLCAiRGVidWciLCAiRGVidWciLCAiXyIsICJlcnJvciIsICJfIiwgIl8iLCAicGF0aCIsICJfIiwgInIiLCAicGF0aCIsICJEZWJ1ZyIsICJEZWJ1ZyIsICJEZWJ1ZyIsICJmcyIsICJmcyIsICJkZWJ1ZyIsICJEZWJ1ZyIsICJmaWxlIiwgImRlYnVnIiwgIkRlYnVnIiwgIkRlYnVnIiwgImRlYnVnIiwgIkRlYnVnIiwgInJ1biIsICJkZWJ1ZyIsICJEZWJ1ZyIsICJzdGRvdXQiLCAicnVuIiwgImRlYnVnIiwgIkRlYnVnIiwgImRlYnVnIiwgIkRlYnVnIiwgInBsYXRmb3JtIiwgInJ1biIsICJlcnJvciIsICJkZWJ1ZyIsICJEZWJ1ZyIsICJjb25maWciLCAicGF0aCIsICJlcnJvciIsICJkZWJ1ZyIsICJEZWJ1ZyIsICJkZWJ1ZyIsICJEZWJ1ZyIsICJkZWJ1ZyIsICJEZWJ1ZyIsICJEZWJ1ZyIsICJkZWJ1ZyIsICJEZWJ1ZyIsICJwYXRoIiwgIl8iLCAicGF0aCIsICJmaWxlIiwgImRlYnVnIiwgIkRlYnVnIiwgIl8iLCAicGF0aCIsICJwbGF0Zm9ybSIsICJydW4iLCAiZXJyb3IiLCAiRGVidWciLCAiZGVidWciLCAiY2hhbGsiLCAicHJpbnRXYXJuaW5ncyIsICJjaGFsayIsICJkZWJ1ZyIsICJEZWJ1ZyIsICJwbGF0Zm9ybSIsICJydW4iLCAicHJpbnRXYXJuaW5ncyIsICJydW4iXQp9Cg==