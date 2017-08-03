var fs = require("fs");
var path = require("path");
var rimraf = require("rimraf");

var indent = require("../lib/indent");
var runSync = require("../lib/runsync");

module.exports = function(options, logger) {
  var logger = logger || indent(console, 0);
  var inDir = options.inDir;

  logger.log("Linking packages...")

  var packages = fs.readdirSync(inDir).filter(function(directory) {
    return fs.statSync(directory).isDirectory();
  });

  var packagePaths = {};

  packages.forEach(function(packageName) {
    packagePaths[packageName] = path.resolve(path.join(inDir, packageName));
  });

  packages.forEach(function(packageName) {
    var fullpath = packagePaths[packageName];

    packages.forEach(function(potential_dependency) {
      var expected_dependency_base_path = path.join(fullpath, "node_modules");
      var expected_dependency_installation_path = path.join(expected_dependency_base_path, potential_dependency);

      if (fs.existsSync(expected_dependency_installation_path) == false) {
        return;
      }

      // So the dependency is installed. Remove it and replace it with the linked version.
      rimraf.sync(expected_dependency_installation_path);

      // Now link it back up.
      runSync('ln', ["-s", packagePaths[potential_dependency], potential_dependency], expected_dependency_base_path, indent(logger, 2), true)
    });
  });

  logger.log("Done.")
};
