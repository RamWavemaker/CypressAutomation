const path = require('path');

function getDownloadPath(filename) {
  return path.join(__dirname, '..', 'downloads', filename); // ✅ Relative to project
}

module.exports = getDownloadPath;
