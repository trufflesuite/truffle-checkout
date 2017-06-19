#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var indent = require("./lib/indent");
var prepare = require("./lib/prepare");
var dependencies = require("./lib/dependencies");
var link = require("./lib/link");
var list = require("./lib/list");
var github = require("./lib/github");

var argv = require('yargs').argv

var working_directory = process.cwd();

if (argv.l) {
  list(working_directory);
  process.exit();
}

var organization = "trufflesuite";

var prepared = {};
var packages = argv._;

var baseBranch = "*";

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

console.log("Getting package list from Github...");
console.log("");

github.repositories(organization).then(function(response) {
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
      organization: organization,
      baseDirectory: working_directory,
      fetch: !!argv.fetch
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

  var logger = indent(console, 2);

  logger.log("Linking packages...");

  // Linking step happens after everything has been prepared
  link(working_directory);

  console.log("");
  console.log("Status:");
  console.log("");

  list(working_directory);
  console.log("")
}).catch(function(e) {
  throw e;
});

process.on('unhandledRejection', function(error) {
  console.log(error);
});
