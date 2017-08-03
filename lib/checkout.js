var path = require("path");

var runSync = require("./runsync");
var indent = require("./indent");
var constants = require("./constants");

/**
 * If this is origin, we need to do something like
 *  `git checkout :branchName`
 *
 * If this is a different remote, we need to do something like
 *  `git checkout [-b] :branchName :remoteRef`
 * ala hub.github.com
 *
 * This has the restriction that
 *   1) only defaultOrganization can use `master`
 *   2) forks must have a branch name available
 *   3) that name must be "globally" unique;
 *      - i.e,. if UserOne:my-feature exists as well as UserTwo:my-feature,
 *        the names will clobber each other, locally.
 *      - this is fine at the moment because the community is relatively small
 *        and the collision only occurs on a local machine iff the user wants
 *        to interact with both UserOne and UserTwo's branches of the same name.
 *
 * Call this like
 * checkout(srcPath, "MyOrgName", "feat/my-feature")
 */
module.exports = function(destination, remoteName, branchName, quiet) {
  var logger = indent(console, 2);

  var quiet = !!quiet;

  var remoteRef = constants.remoteRef(remoteName, branchName);

  var cmdArgs = ["checkout"];
  cmdArgs.push(branchName);

  try {
    // if the branch already exists, this will succeed
    // `git checkout :branchName`
    return runSync("git", cmdArgs, destination, logger, quiet);
  } catch (error) {
  }

  // in this case, the branch doesn't yet exist, so we need to created it
  if (!constants.isDefaultRemote(remoteName)) {
    cmdArgs.push(remoteRef);
    cmdArgs.splice(1, 0, "-b")
  }

  // `git checkout -b :branchName :remoteRef`
  return runSync("git", cmdArgs, destination, logger, quiet);
};
