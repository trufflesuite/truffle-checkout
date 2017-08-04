var fs = require("fs");
var path = require("path");

var indent = require("../lib/indent");
var packages = require("../lib/packages");
var runSync = require("../lib/runsync");

function parseFilters(args) {
  var parents = [];
  var children = [];

  if (args.length == 0) {
    parents = ["truffle"];
    children = ["truffle"];
  } else if (args.length == 1) {
    parents = ["truffle"];
    children = [args[0]];
  } else if (args.length == 2) {
    parents = [args[0]];
    children = [args[1]];
  } else {
    var separatorIndex = args.indexOf("~~");

    if (separatorIndex == -1) {
      throw new Error(
        "Invalid arguments format, must specify `~~` to separate parent/child arguments"
      );
    }

    parents = args.slice(0, separatorIndex);
    children = args.slice(separatorIndex + 1);
  }

  return {
    parents: parents,
    children: children
  }
}

function resolvePackagesToTest(workspace, parents, children) {
  var descendents = [];
  parents.forEach(function(pkgName) {
    var pkgDescendents = packages.traverse(workspace, pkgName, {dev: true});
    descendents = descendents.concat(pkgDescendents);
  });
  descendents = new Set(descendents);

  var ancestors = [];
  children.forEach(function(pkgName) {
    var pkgAncestors = packages.traverse(workspace, pkgName, {dev: true, reverse: true});
    ancestors = ancestors.concat(pkgAncestors);
  });

  var intersection = new Set(ancestors.filter(function(pkgName) {
    return descendents.has(pkgName);
  }));

  return Array.from(intersection);
}

function hasTests(workspace, pkgName) {
  var pkgInfo = packages.infoFor(workspace, pkgName);

  if (!pkgInfo.scripts.test) {
    return false;
  }

  // hack because mocha doesn't have a dry run
  var hasTestDirectory = (
    fs.existsSync(path.resolve(workspace, pkgName, "test")) ||
    fs.existsSync(path.resolve(workspace, pkgName, "tests"))
  );

  if (!hasTestDirectory) {
    return false;
  }

  return true;
}

function testPackage(options, logger) {
  var logger = logger || indent(console, 0);
  var workspace = options.workspace;
  var directory = options.directory;

  if (!hasTests(workspace, directory)) {
    logger.log(`Skipping package ${directory}, no tests defined`);
    return;
  }

  logger.log(`Testing ${directory}`);
  runSync(
    "npm", ["test"],
    path.join(workspace, directory),
    logger
  );
  logger.log("Tests passed.");
}

module.exports = function(options, logger) {
  var logger = logger || indent(console, 0);
  var workspace = options.workspace;
  var filters = parseFilters(options.packagesSpec);
  var strictChildren = options.strictChildren || false;

  var parents = filters.parents;
  var children = filters.children;

  logger.log(
    `Running tests in packages descending from [${filters.parents.join(" ")}]` +
      ` and ancestors of [${filters.children.join(" ")}]:`
  );

  var pkgs = resolvePackagesToTest(workspace, filters.parents, filters.children);

  if (strictChildren) {
    pkgs = pkgs.filter(function(pkgName) {
      var pkgInChildren = new Set(children).has(pkgName);
      return !pkgInChildren;
    });
  }

  logger.log(
    pkgs.map(function(name) { return `  - ${name}`; }).join("\n")
  );

  pkgs.forEach(function(pkgName) {
    logger.log();

    try {
      testPackage({
        workspace: workspace,
        directory: pkgName
      }, logger);
    } catch(error) {
      logger.log("Tests failed.");
    }
  });
}
