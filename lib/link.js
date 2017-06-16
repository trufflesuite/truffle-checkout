var fs = require("fs");
var path = require("path");
var rimraf = require("rimraf");
var runSync = require("./runsync");

module.exports = function(working_directory) {
  var packages = fs.readdirSync(working_directory).filter(function(directory) {
    return fs.statSync(directory).isDirectory();
  });

  var packagePaths = {};

  packages.forEach(function(packageName) {
    packagePaths[packageName] = path.resolve(path.join(working_directory, packageName));
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
      runSync('ln', ["-s", packagePaths[potential_dependency], potential_dependency], expected_dependency_base_path, console, true)
    });
  });
};
