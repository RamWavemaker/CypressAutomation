// utils/AwsController.js
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

class AwsController {
  async downloadFromS3({ bucketName, key, downloadPath }) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    const params = { Bucket: bucketName, Key: key };

    // Creating local folder if it doesn't exist
    const folderPath = path.dirname(downloadPath);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    if (fs.existsSync(downloadPath)) {
      console.log("file already exists");
      return `⚠️ File already exists at ${downloadPath}`;
    }

    // Downloading the file from S3 and save locally
    const data = await s3.getObject(params).promise();
    fs.writeFileSync(downloadPath, data.Body);
    return `Downloaded ${key} to ${downloadPath}`;
  }
}

module.exports = new AwsController();
