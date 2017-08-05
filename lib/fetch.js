var path = require("path");

var runSync = require("./runsync");
var indent = require("./indent");

var constants = require("./constants");

module.exports = function(destination, remoteName, branchName, quiet) {
  var logger = indent(console, 2);
  var remoteName = remoteName || constants.defaultRemote;
  var branchName = branchName || constants.defaultBranch;
  var quiet = !!quiet;

  var repoName = path.basename(destination);

  return runSync('git', ["fetch", remoteName, branchName], destination, logger, quiet);
};
