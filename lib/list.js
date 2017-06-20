var fs = require("fs");
var status = require("./status");
var indent = require("./indent");
var path = require("path");

module.exports = function(working_directory) {
  var logger = indent(console, 2);

  var statuses = status(working_directory);
  var packageNames = statuses.map(function(item) {
    return item.package;
  });

  var longestNameLength = 0;

  packageNames.forEach(function(packageName) {
    if (packageName.length > longestNameLength) {
      longestNameLength = packageName.length;
    }
  });

  // Add an extra space
  longestNameLength += 1;

  statuses.forEach(function(packageStatus) {
    var spaceCount = longestNameLength - packageStatus.package.length;
    var spacing = Array(spaceCount + 1).join(" ");

    // \u271a - plus
    // \u2b06 - up
    // \u2b07 - down

    var statusSymbols = "";

    if (packageStatus.localChanges) {
      statusSymbols += "\u271a ";
    }

    if (packageStatus.needsPush) {
      statusSymbols += "\u2b06 ";
    }

    if (packageStatus.needsPull) {
      statusSymbols += "\u2b07 ";
    }

    logger.log(packageStatus.package + spacing + ": " + packageStatus.branch + " " + statusSymbols);
  });
};
