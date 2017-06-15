#!/usr/bin/env node
var env = require("./env");

var tests = [];

var ignore = new Set([
  'ganache-core',
  'merkle-patricia-tree'
]);

function pkgTests(pkgName, srcpath) {
  var pkgs = env.availablePackages(srcpath);

  var handlers = {
    enter: function(pkgName, pkgs, depth) {
    },

    leave: function(pkgName, pkgs, depth) {
      var pkg = pkgs[pkgName];
      var cwd = pkg._path;

      if (!ignore.has(pkgName) && pkg.scripts.test) {
        tests.push(cwd);
      }
    }
  }

  return env.traverse(handlers, pkgName, pkgs);
}


var pkgName;
if (process.argv.length > 2) {
  pkgName = process.argv[2];
} else {
  pkgName = "truffle";
}

var home = process.env.TRUFFLEHOME;

return pkgTests(pkgName, home).then(function() {
  console.log(tests.join(' '));
});
