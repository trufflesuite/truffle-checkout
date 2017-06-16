var runSync = require("./runsync");
var indent = require("./indent");
var path = require("path");

module.exports = function(destination) {
  var logger = indent(console, 2);

  var repoName = path.basename(destination);

  return runSync('git', ["fetch", "origin"], destination, logger);;
};
