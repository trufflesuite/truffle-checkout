var path = require("path");
var fs = require("fs");
var indent = require("./indent");
var clone = require("./clone");
var checkout = require("./checkout");
var fetch = require("./fetch");
var dependencies = require("./dependencies");

module.exports = function(options) {
  if (options.fetch !== true) {
    options.fetch = false;
  }

  //packageName, branch, organization, baseDirectory) {
  var logger = indent(console, 2);
  logger.log(`- ${options.packageName}`);
  logger.log();

  var destination = path.join(options.baseDirectory, options.packageName);

  if (fs.existsSync(destination) == false) {
    clone(options.organization, options.packageName, options.baseDirectory);
  }

  if (options.fetch) {
    fetch(destination);
  }

  if (options.branch != "*") {
    checkout(destination, options.branch);
  }

  dependencies.install(destination);

  logger.log();

  return destination;
};
