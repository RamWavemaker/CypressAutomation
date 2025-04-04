const { defineConfig } = require("cypress");
const { allureCypress } = require("allure-cypress/reporter");
const { Status } = require("allure-js-commons");
const os = require("node:os");

module.exports = defineConfig({
  projectId: 'czgj9f',
  video: true,
  videoUploadOnPasses: true,
  e2e: {
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      allureCypress(on, config, {
        resultsDir: "allure-results",
        links: {
          issue: {
            nameTemplate: "Issue #%s",
            urlTemplate: "https://issues.example.com/%s",
          },
          tms: {
            nameTemplate: "TMS #%s",
            urlTemplate: "https://tms.example.com/%s",
          },
          jira: {
            urlTemplate: (v) => `https://jira.example.com/browse/${v}`,
          },
        },
        categories: [
          {
            name: "foo",
            messageRegex: "bar",
            traceRegex: "baz",
            matchedStatuses: [Status.FAILED, Status.BROKEN],
          },
        ],
        environmentInfo: {
          os_platform: os.platform(),
          os_release: os.release(),
          os_version: os.version(),
          node_version: process.version,
        },
      });

      return config;
    },
  },
});
