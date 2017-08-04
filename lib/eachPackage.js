var fs = require("fs");
var path = require("path");

module.exports = function (workspace, iterator, opts) {
  var opts = opts || {};
  var without = opts.without || [];

  var directories = fs.readdirSync(workspace).filter(function(directory) {
    return fs.statSync(directory).isDirectory();
  });

  directories.forEach(function(directory) {
    var packageName = path.basename(directory);
    if (!without.includes(packageName)) {
      iterator(packageName, path.resolve(workspace, directory));
    }
  });
}
