var runSync = require("./runsync");
var indent = require("./indent");
var path = require("path");
var fs = require("fs");

module.exports = {
  delete: function(srcpath) {
    if (fs.existsSync(path.join(srcpath, "node_modules"))) {
      var logger = indent(console, 2);
      return runSync('rm', ["-rf", "node_modules"], srcpath, logger);
    }
  },

  install: function(srcpath) {
    var logger = indent(console, 2);
    return runSync('npm', ["install"], srcpath, logger);
  },

  installed: function(srcpath) {
    var expected_node_modules_path = path.join(srcpath, "node_modules");

    var installedPackages = {};

    if (fs.existsSync(expected_node_modules_path)) {
      fs.readdirSync(expected_node_modules_path).map(function(package) {
        installedPackages[package] = path.join(expected_node_modules_path, package);
      });
    }
    return installedPackages;
  }
};
