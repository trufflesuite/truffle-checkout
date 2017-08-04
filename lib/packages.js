var fs = require("fs");
var path = require("path");

module.exports = {
  forEachIn: function (workspace, iterator, opts) {
    var opts = opts || {};
    var without = opts.without || [];

    var directories = fs.readdirSync(workspace).filter(function(directory) {
      return fs.statSync(directory).isDirectory();
    });

    directories.forEach(function(directory) {
      if (!without.includes(packageName)) {
        iterator(path.basename(directory), path.resolve(workspace, directory));
      }
    });
  }
}
