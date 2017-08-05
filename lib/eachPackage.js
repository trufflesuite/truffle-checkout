var fs = require("fs");
var path = require("path");

module.exports = function (inDir, iterator, opts) {
  var opts = opts || {};
  var without = opts.without || [];

  var directories = fs.readdirSync(inDir).filter(function(directory) {
    return fs.statSync(directory).isDirectory();
  });

  directories.forEach(function(directory) {
    var packageName = path.basename(directory);
    if (!without.includes(packageName)) {
      iterator(packageName, path.resolve(inDir, directory));
    }
  });
}
