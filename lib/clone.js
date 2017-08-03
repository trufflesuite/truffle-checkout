var runSync = require("./runsync");
var indent = require("./indent");
var buildGitUrl = require("./buildGitUrl");

module.exports = function(organization, repoName, destination) {
  var url = buildGitUrl(organization, repoName)

  var logger = indent(console, 2);

  return runSync('git', ['clone', url], destination, logger);
};
