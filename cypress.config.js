const { defineConfig } = require("cypress");
require('dotenv').config();
const awsController = require('./cypress/utils/AwsController');
const allureCypress = require("allure-cypress/reporter").allureCypress;
const os = require("node:os");
const fs = require("fs-extra");
const path = require("path");

module.exports = defineConfig({
  projectId: 'sorrycypress123',
  video: true,
  screenshotOnRunFailure: true,
  e2e: {
    defaultCommandTimeout: 10000,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {

      allureCypress(on, config, {
        resultsDir: process.env.ALLURE_RESULTS_DIR || "allure-results",
      });

      on('task', {
        async downloadFileFromS3({ key, downloadPath }) {
          const bucketName = process.env.S3_BUCKET_NAME;
          return await awsController.downloadFromS3({ bucketName, key, downloadPath });
        },

        fileExists(filePath) {
          const fs = require('fs');
          return fs.existsSync(filePath);
        }
      });

      return config;
    },
  },
});
