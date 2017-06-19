var runSync = require("./runsync");
var indent = require("./indent");

module.exports = function(organization, repoName, destination) {
  var ssh_url = "git@github.com:" + organization + "/" + repoName + ".git";

  var logger = indent(console, 2);

  var ok = runSync('git', ['clone', ssh_url], destination, logger);

  return ok;
};
