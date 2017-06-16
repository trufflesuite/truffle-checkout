var fs = require("fs");
var runSync = require("./runsync");
var path = require("path");

module.exports = function(working_directory) {
  var directories = fs.readdirSync(working_directory).filter(function(directory) {
    return fs.statSync(directory).isDirectory();
  });

  var branches = {};

  directories.forEach(function(directory) {
    var srcpath = path.join(working_directory, directory);

    var result = runSync('git', ["symbolic-ref", "HEAD"], srcpath, console, true);

    branches[directory] = result.stdout.toString().replace("refs/heads/", "").trim();
  });

  return branches;
};
