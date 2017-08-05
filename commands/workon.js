var fs = require("fs");
var path = require("path");

var status = require("../lib/status");
var indent = require("../lib/indent");
var constants = require("../lib/constants");
var remotes = require("../lib/remotes");
var fetch = require("../lib/fetch");
var checkout = require("../lib/checkout");
var pull = require("../lib/pull");

var packages = require("../lib/packages");

/**
 * [workon] For each package, swaps to the specified org/branch combo
 *   if such a branch exists, otherwise switching to
 *   the default org and default branch
 */
module.exports = function(options, logger) {
  var logger = logger || indent(console, 0);
  var workspace = options.workspace;
  var orgName = options.orgName || constants.defaultOrganization;
  var remoteName = constants.remoteForOrg(orgName);
  var branchName = options.branchName || constants.defaultBranch;

  logger.log(`Swapping to ${remoteName}/${branchName} where available, otherwise ${constants.defaultOrganization}/${constants.defaultBranch}`);
  logger.log("This runs `git remote add`, `git fetch`, `git checkout`, and `git pull` for each package available.");
  logger.log("If you have unstaged changes, this command will fail in the appropriate directory.");
  logger.log();

  packages.forEachIn(workspace, function(packageName, srcPath) {
    // for each package, add the specified remote if not exists
    if (!remotes.has(srcPath, orgName)) {
      remotes.add(srcPath, orgName);
    }

    var selectedRemote = remoteName;
    var selectedBranch = branchName;

    // fetch the specified remote
    try {
      fetch(srcPath, selectedRemote, selectedBranch, true);
    } catch (error) {
      // we couldn't fetch this remote, which means it doesn't exist.
      // instead, let's fetch/checkout the defaults, which should definitely exist
      selectedRemote = constants.defaultRemote;
      selectedBranch = constants.defaultBranch;

      fetch(srcPath, selectedRemote, selectedBranch, true);
    }

    logger.log(`[${packageName}] ${selectedRemote}/${selectedBranch}`)

    // now check out that branch
    checkout(srcPath, selectedRemote, selectedBranch, true);

    // and double check we've got the latest code on that branch
    pull(srcPath, selectedRemote, selectedBranch, true);
  });
};
