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
    var trackedChanges = runSync('git', ["diff-index", "HEAD"], srcpath, console, true);
    var untrackedChanges = runSync('git', ["ls-files", "--other", "--exclude-standard", "--directory"], srcpath, console, true)

    // TODO: I could probably simplify this expression.
    var totalChanges =
      (trackedChanges.stdout.toString().split(OS.EOL).length - 1) +
      (untrackedChanges.stdout.toString().split(OS.EOL).length - 1);

    var hasLocalChanges = totalChanges > 0;

    statuses.push({
      package: directory,
      branch: branchResult.stdout.toString().replace("refs/heads/", "").trim(),
      localChanges: hasLocalChanges
    });
  });

  return statuses;
};
