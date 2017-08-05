var fs = require("fs");
var path = require("path");

var indent = require("../lib/indent");
var runSync = require("../lib/runsync");

var packages = require("../lib/packages")

module.exports = function(options, logger) {
  var logger = logger || indent(console, 0);
  var workspace = options.workspace;

  var thisCwd = process.cwd();

  logger.log("Linking packages...");

  // Build up a cache
  var packages = [];
  var packagePaths = {};
  packages.forEachIn(workspace, function(packageName, srcPath) {
    packages.push(packageName);
    packagePaths[packageName] = srcPath;
  }, { without: ['truffle'] })

  packages.forEach(function(packageName) {
    // run `npm link` in every package directory (except `truffle`) because it
    //  clobbers the same `truffle` executable in truffle-core
    runSync("npm", ["link"], packagePaths[packageName], indent(logger, 2));
  })

  packages.forEach(function(packageName) {
    var srcPath = packagePaths[packageName];

    packages.forEach(function(potentialDependencyPackageName) {
      // @TODO - we should probably parse package.json to determine if we need
      //  to link dependencies
      var expected_dependency_base_path = path.join(srcPath, "node_modules");
      var expected_dependency_installation_path = path.join(
        expected_dependency_base_path,
        potentialDependencyPackageName
      );
      if (fs.existsSync(expected_dependency_installation_path) == false) {
        return;
      }

      // So the dependency is installed. Use `npm link` to link it.
      runSync("npm", ["link", potentialDependencyPackageName], packagePaths[packageName], indent(logger, 2));
    });
  });

  logger.log("Done.");
};
