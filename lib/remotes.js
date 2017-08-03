var path = require("path");

var runSync = require("./runsync");
var indent = require("./indent");
var buildGitUrl = require("./buildGitUrl");

module.exports = {
  /**
   * [add] Adds a git remote given the destination path and the organization name
   * Resolves to `git remote add :name git@github.com/:org/:repo.git`
   */
  add: function(destination, orgName) {
    var logger = indent(console, 2);

    var repoName = path.basename(destination);
    var url = buildGitUrl(orgName, repoName);
    return runSync('git', ["remote", "add", orgName, url], destination, logger, true);
  },
  has: function(destination, orgName) {
    var logger = indent(console, 2);

    var repoName = path.basename(destination);
    var url = buildGitUrl(orgName, repoName);

    try {
      runSync('git', ["remote", "get-url", orgName], destination, logger, true);

      // the command succeeded, so this remote exists
      return true
    } catch (error) {
      // it failed, so this remote has not been added
      return false
    }
  }
}
