var fs = require("fs");
var path = require("path");

module.exports = {
  forEachIn: function (workspace, iterator) {
    var directories = fs.readdirSync(workspace).filter(function(directory) {
      return fs.statSync(directory).isDirectory();
    });

    directories.forEach(function(directory) {
      iterator(path.basename(directory), path.resolve(workspace, directory))
    });
  }
}
