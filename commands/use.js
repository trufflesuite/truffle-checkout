var link = require("./link");
var list = require("./list");

var indent = require("../lib/indent");
var prepare = require("../lib/prepare");
var dependencies = require("../lib/dependencies");
var github = require("../lib/github");

var constants = require("../lib/constants");

/**
 * [use] this function is used to initialize a
 *   (or repair a previously-initialized) directory
 *   for truffle development with specific package versions
 */
module.exports = function(options, logger) {
  var logger = logger || indent(console, 0);
  var workspace = options.workspace;
  var fetch = options.fetch;

  var packages = options.packages;
  var baseBranch = constants.defaultBranch;

  var prepared = {};

  // If we didn't specify any packages, we want all of them, starting with `truffle`
  if (packages.length == 0) {
    packages = ["truffle:" + baseBranch];
  }

  // For any package that doesn't specify a branch selector, specify it.
  packages = packages.map(function(package) {
    if (package.indexOf("@") < 0 && package.indexOf(":") < 0) {
      package = package + ":" + baseBranch;
    }
    return package;
  });

  var branchOverrides = {};

  // Record all 1-off branch overrides ("@" selector)
  packages.forEach(function(package) {
    if (package.indexOf("@") >= 0) {
      var pieces = package.split("@")
      branchOverrides[pieces[0]] = pieces[1];
    }
  });

  packages = packages.reverse();

  logger.log("Getting package list from Github...");
  logger.log();

  github.repositories(constants.defaultOrganization).then(function(response) {
    var repositories = response.data.map(function(repo) {
      return repo.name;
    });

    while (packages.length > 0) {
      var currentPackage = packages.shift();

      var match = currentPackage.match(/(.*)(@|:)(.*)/);

      var currentPackageName = match[1];
      var selector = match[2];
      var packageBranch = branchOverrides[currentPackageName] || match[3];
      var dependencyBranch = baseBranch;

      if (selector == ":") {
        dependencyBranch = packageBranch;
      }

      // Just in case.
      if (prepared[currentPackageName] != null) {
        continue;
      }

      // Not installed yet? Let's do it.
      var checkoutLocation = prepare({
        packageName: currentPackageName,
        branch: packageBranch,
        organization: constants.defaultOrganization,
        baseDirectory: workspace,
        fetch: fetch,
      });

      var dependedPackages = dependencies.installed(checkoutLocation);

      // For all packages that are depended on that are also part the organization,
      // that haven't already been prepared, prepare them too.
      repositories.forEach(function(packageName) {
        if (dependedPackages[packageName] != null && prepared[packageName] == null) {
          packages.push(packageName + selector + dependencyBranch);
        }
      });

      // Mark as prepared
      prepared[currentPackageName] = packageBranch;
    }

    // Linking step happens after everything has been prepared
    link({ workspace: workspace }, indent(logger, 2));

    // Display status
    list({ workspace: workspace }, indent(logger, 2));
    logger.log("")
  }).catch(function(e) {
    throw e;
  });
};
