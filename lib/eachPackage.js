var fs = require("fs");
var path = require("path");

module.exports = function (inDir, iterator) {
  var directories = fs.readdirSync(inDir).filter(function(directory) {
    return fs.statSync(directory).isDirectory();
  });

  directories.forEach(function(directory) {
    iterator(path.basename(directory), path.resolve(inDir, directory))
  });
}
