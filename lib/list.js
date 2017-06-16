var fs = require("fs");
var getBranches = require("./branches");
var indent = require("./indent");
var path = require("path");

module.exports = function(working_directory) {
  var logger = indent(console, 2);

  var branches = getBranches(working_directory);
  var branchNames = Object.keys(branches);

  var longestNameLength = 0;

  branchNames.forEach(function(branchName) {
    if (branchName.length > longestNameLength) {
      longestNameLength = branchName.length;
    }
  });

  // Add an extra space
  longestNameLength += 1;

  branchNames.forEach(function(branchName) {
    var spaceCount = longestNameLength - branchName.length;
    var spacing = Array(spaceCount + 1).join(" ");

    logger.log(branchName + spacing + ": " + branches[branchName]);
  });
};
