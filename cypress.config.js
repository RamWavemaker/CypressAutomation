const { defineConfig } = require("cypress");
const { allureCypress } = require("allure-cypress/reporter");
const { Status } = require("allure-js-commons");
const os = require("node:os");
const fs = require("fs-extra");
const path = require("path");

module.exports = defineConfig({
  projectId: 'czgj9f',
  video: true,
  videoUploadOnPasses: true,
  screenshotOnRunFailure: true,
  e2e: {
    defaultCommandTimeout: 10000,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {

      on('before:run', () => {
        const resultsPath = path.join(__dirname, 'allure-results');
        if (fs.existsSync(resultsPath)) {
          fs.emptyDirSync(resultsPath);
          console.log('🧹 Cleared old Allure results');
        }
      });

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
