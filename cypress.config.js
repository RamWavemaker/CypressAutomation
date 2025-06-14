const { defineConfig } = require("cypress");
require('dotenv').config();
const awsController = require('./cypress/utils/AwsController');
const { cloudPlugin } = require("cypress-cloud/plugin");
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

      return cloudPlugin(on, config);
    },
  },
});
