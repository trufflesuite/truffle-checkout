var runSync = require("./runsync");
var indent = require("./indent");
var path = require("path");
var fs = require("fs");

module.exports = {
  install: function(srcpath) {
    var logger = indent(console, 2);

    var command = "npm";

    if (process.platform == "win32") {
      command += ".cmd";
    }    

    return runSync(command, ["install"], srcpath, logger);
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
