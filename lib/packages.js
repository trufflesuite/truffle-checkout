var fs = require("fs");
var path = require("path");

function infoFor(workspace, pkgName) {
  var filename = path.resolve(workspace, pkgName, 'package.json');
  return JSON.parse(fs.readFileSync(filename));
}

function forEachIn(workspace, iterator, opts) {
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


function dependenciesOf(workspace, pkgName, options) {
  options = options || {};
  options.dev = options.dev || false;
  options.devOnly = options.devOnly || false;

  var pkgInfo = infoFor(workspace, pkgName);

  var dependencies = [];
  if (!options.devOnly) {
    var names = Object.keys(pkgInfo.dependencies || {});
    dependencies = dependencies.concat(names);
  }

  if (options.devOnly || options.dev) {
    var names = Object.keys(pkgInfo.devDependencies || {});
    dependencies = dependencies.concat(names);
  }

  return dependencies.filter(function(pkgName) {
    return fs.existsSync(path.resolve(workspace, pkgName));
  });
}

function dependingOn(workspace, pkgName, options) {
  options = options || {};
  options.dev = options.dev || false;
  options.devOnly = options.devOnly || false;

  var pkgInfo = infoFor(workspace, pkgName);

  var doesDependOn = [];
  forEachIn(workspace, function(possiblePkgName) {
    var deps = new Set(dependenciesOf(workspace, possiblePkgName, options));
    if (deps.has(pkgName)) {
      doesDependOn.push(possiblePkgName);
    }
  });
  return doesDependOn;
}

function traverse(workspace, pkgName, options) {
  options = options || {};
  // default is to traverse down (to dependents)
  options.reverse = options.reverse || false;
  options.strict = options.strict || false;
  options.dev = options.dev || false;
  options.devOnly = options.devOnly || false;

  var stepFunc = options.reverse && dependingOn || dependenciesOf;

  var descendents = new Set([]);
  var unsearched = [pkgName];

  while (unsearched.length > 0) {
    var pkgName = unsearched.pop();
    descendents.add(pkgName);

    var deps = stepFunc(workspace, pkgName, {
      dev: options.dev,
      devOnly: options.devOnly
    });

    deps.forEach(function(depName) {
      if (!descendents.has(depName)) {
        unsearched.push(depName);
      }
    });
  }


  if (options.strict) {
    descendents.delete(pkgName);
  }

  return Array.from(descendents);
}

module.exports = {
  infoFor: infoFor,
  dependenciesOf: dependenciesOf,
  dependingOn: dependingOn,
  traverse: traverse,
  forEachIn: forEachIn
}
