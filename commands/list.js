var fs = require("fs");
var path = require("path");

var status = require("../lib/status");
var indent = require("../lib/indent");

module.exports = function(options, logger) {
  var logger = logger || indent(console, 0);
  var inDir = options.inDir;

  logger.log();
  logger.log("Status:");
  logger.log();

  var statuses = status(inDir);
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
