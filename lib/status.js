var fs = require("fs");
var runSync = require("./runsync");
var path = require("path");
var OS = require("os");

module.exports = function(working_directory) {
  var directories = fs.readdirSync(working_directory).filter(function(directory) {
    return fs.statSync(directory).isDirectory();
  });

  var statuses = [];

  directories.forEach(function(directory) {
    var srcpath = path.join(working_directory, directory);

    var branchResult = runSync('git', ["symbolic-ref", "HEAD"], srcpath, console, true);
    var branch = branchResult.stdout.toString().replace("refs/heads/", "").trim();

    var availableBranches = runSync(`git`, ["branch", "-a"], srcpath, console, true);
    availableBranches = availableBranches.stdout.toString().split("\n");

    var trackedChanges = runSync('git', ["diff-index", "HEAD"], srcpath, console, true);
    var untrackedChanges = runSync('git', ["ls-files", "--other", "--exclude-standard", "--directory"], srcpath, console, true)

    var remoteBranchIsAvailable = false;
    var localAhead = 0;
    var remoteAhead = 0;

    var expectedRemote = "remotes/origin/" + branch;

    for (var i = 0; i < availableBranches.length; i++) {
      var currentBranch = availableBranches[i];
      if (currentBranch.indexOf(expectedRemote) >= 0) {
        remoteBranchIsAvailable = true;
        break;
      }
    }

    if (remoteBranchIsAvailable) {
      var aheadOrBehind = runSync('git', ["rev-list", "--left-right", "--count", branch + "...origin/" + branch], srcpath, console, true);

      var differences = aheadOrBehind.stdout.toString().trim().split("\t").map(function(str) {
        return parseInt(str);
      });

      localAhead = differences[0];
      remoteAhead = differences[1];
    } else {
      // If the remote branch isn't available, then we definitely require a push.
      localAhead = 1;
    }

    // TODO: I could probably simplify this expression.
    var totalChanges =
      (trackedChanges.stdout.toString().split(OS.EOL).length - 1) +
      (untrackedChanges.stdout.toString().split(OS.EOL).length - 1);

    var hasLocalChanges = totalChanges > 0;

    statuses.push({
      package: directory,
      branch: branch,
      localChanges: hasLocalChanges,
      needsPush: localAhead > 0,
      needsPull: remoteAhead > 0
    });
  });

  return statuses;
};
