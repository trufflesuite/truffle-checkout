var fs = require("fs");
var path = require("path");

var indent = require("./indent");
var clone = require("./clone");
var checkout = require("./checkout");
var fetch = require("./fetch");
var dependencies = require("./dependencies");
var constants = require("./constants");

module.exports = function(options) {
  options.fetch = options.fetch || false

  //packageName, branch, organization, baseDirectory) {
  var logger = indent(console, 2);
  logger.log(`- ${options.packageName}`);
  logger.log();

  var destination = path.join(options.baseDirectory, options.packageName);

  if (fs.existsSync(destination) == false) {
    clone(options.organization, options.packageName, options.baseDirectory);
  }

  var remoteName = constants.remoteForOrg(options.organization);

  if (options.fetch) {
    fetch(destination, remoteName, options.branch);
  }

  if (options.branch != "*") {
    checkout(destination, remoteName, options.branch);
  }

  dependencies.install(destination);

  logger.log();

  return destination;
};
