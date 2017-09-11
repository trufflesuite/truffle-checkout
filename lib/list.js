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

    var symbols = {
      plus: "\u271a",
      up: "\u2b06",
      down: "\u2b07"
    };

    var statusSymbols = "";

    if (packageStatus.localChanges) {
      statusSymbols += symbols.plus + " ";
    }

    if (packageStatus.needsPush) {
      statusSymbols += symbols.up + " ";
    }

    if (packageStatus.needsPull) {
      statusSymbols += symbols.down + " ";
    }

    logger.log(packageStatus.package + spacing + ": " + packageStatus.branch + " " + statusSymbols);
  });
};
