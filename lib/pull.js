var path = require("path");

var runSync = require("./runsync");
var indent = require("./indent");
var constants = require("./constants");

/**
 *
 */
module.exports = function(destination, remoteName, branchName, quiet) {
  var logger = indent(console, 2);

  var quiet = !!quiet;

  return runSync("git", ["pull", "--rebase", remoteName, branchName], destination, logger, quiet);
};
