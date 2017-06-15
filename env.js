var GitHubApi = require('github');
var spawnSync = require('child_process').spawnSync;
var fs = require('fs');
var path = require('path');

var github = new GitHubApi();

function runSync(command, args, cwd, log, err) {
  log(`$ ${command} ${ args.join(" ") }`);
  var result = spawnSync(command, args, {
    cwd: cwd,
    env: Object.assign({}, process.env, { PATH: process.env.PATH + ':/usr/local/bin' })
  });
  if (result.status === 0) {
    log(`exit 0 (ok).`);
    return true;
  } else {
    log(result.stdout);
    err(`exit ${result.status}, stderr:`);
    err(`  ${result.stderr}`);
    return false;
  }
}

function indent(logger, depth, step) {
  if (step === undefined) { step = 2; }
  var spacing = Array(depth+1).join(Array(step+1).join(" "));

  return function(line) {
    if (line === undefined) {
      logger();
      return;
    }
    logger(`${spacing}${line}`);
  }
}

function packageDependencies(pkgName, pkgs) {
  var pkg = pkgs[pkgName];
  var pkgNames = new Set(Object.keys(pkgs));

  return Object.keys(pkg.dependencies || {})
    .concat(Object.keys(pkg.devDependencies || {}))
    .filter(function (dep) { return pkgNames.has(dep) });
}

function when(func) {
  var dataArgs = Array.prototype.slice.call(arguments, 1);
  return new Promise(function(resolve, reject) {
    try {
      resolve(func.apply(this, dataArgs));
    } catch (e) {
      reject(e);
    }
  });
}

function traverse(handlers, pkgName, pkgs, prior, depth) {
	if (handlers instanceof Function) {
		handlers = {leave: handlers};
	}
  prior = prior || new Set();
  depth = depth || 0;

  if (prior.has(pkgName)) {
    return new Promise(function (resolve) { resolve() });
  }

  var deps = packageDependencies(pkgName, pkgs);

	return when(handlers.enter, pkgName, pkgs, depth).then(function (enterResult) {
		var promises = deps.map(function (dep) {
      var hadDepAlready = prior.has(dep);

      var newPrior = new Set([...prior, pkgName, ...deps]);
      if (!hadDepAlready) {
        newPrior.delete(dep);
      }

			return traverse(handlers, dep, pkgs, newPrior, depth+1);
		});

		return Promise.all(promises);
	}).then(function (traverseResults) {
    var pkgTraversals = {};
    for (var i = 0; i < deps.length; i++) {
      pkgTraversals[deps[i]] = traverseResults[i];
    }

		return when(handlers.leave, pkgName, pkgs, depth, pkgTraversals)
	});
}

function testTraverse(pkgName, pkgs) {
  var handlers = {
    enter: function (pkgName, pkgs, depth) {
      indent(console.log, depth)(`enter ${pkgName}`);
    },

    leave: function (pkgName, pkgs, depth, pkgTraversals) {
      indent(console.log, depth)(`leave ${pkgName}`);
    }
  }

  return traverse(handlers, pkgName, pkgs, new Set(), 0);
}


function linkTree(pkgName, pkgs) {
  var handlers = {
    enter: function (pkgName, pkgs, depth) {
      indent(console.log, depth)(`${pkgName}:`);
    },

    leave: function(pkgName, pkgs, depth, pkgTraversals) {
      var log = indent(console.log, depth);
      var err = indent(console.error, depth);

      var pkg = pkgs[pkgName];
      var cwd = pkg._path;

      Object.keys(pkgTraversals).forEach(function (dep) {
        var log = indent(console.log, depth+1);
        var err = indent(console.error, depth+1);
        return runSync('npm', ['link', dep], cwd, log, err);
      });

      var ok = runSync('npm', ['link'], cwd, log, err);
      log(`done ${pkgName}.`);
      log();
      return ok;
    }
  };

  return traverse(handlers, pkgName, pkgs, new Set(), 0);
}

function initEnv() {
  var home = process.env.TRUFFLEHOME;

  // console.log("Cloning Repositories");
  // console.log("====================");
  // console.log();

  // cloneRepos(home).then(function (ok) {
  //   if (!ok) {
  //     return;
  //   }

    console.log("Identifying npm packages");
    console.log("========================");
    console.log();

    var pkgs = availablePackages(home);
    pkglog = indent(console.log, 1);
    Object.keys(pkgs).forEach(function (pkgName) {
      pkglog(`- ${pkgName}`);
    });

    console.log(dependencyDOT(pkgs));

    // console.log("Performing Linking");
    // console.log("==================");
    // linkTree("truffle", pkgs, new Set(), 0);
  // });
}

module.exports = {
  cloneRepos: function(srcpath) {
    return github.repos.getForOrg({
      org: "trufflesuite",
      per_page: 200
    }).then(function(resp) {
      return resp.data.reduce(function (ok, repo) {
        if (!ok) {
          return false;
        }

        var log = indent(console.log, 1);
        log(`- ${repo.name}`);
        log();

        ok = runSync(
          'git', ['clone', repo.ssh_url], srcpath,
          indent(console.log, 2), indent(console.error, 2)
        );
        log();

        return ok;
      }, true);
    });
  },

  availablePackages: function(srcpath) {
    return fs.readdirSync(srcpath).reduce(function (pkgs, dirname) {
      var fullpath = path.join(srcpath, dirname);
      var pkg = path.join(fullpath, 'package.json');
      if (!fs.lstatSync(fullpath).isDirectory() || !fs.existsSync(pkg)) {
        return pkgs;
      }

      var pkgInfo = JSON.parse(fs.readFileSync(pkg));
      pkgInfo._path = fullpath;

      pkgs[pkgInfo.name] = pkgInfo;
      return pkgs;
    }, {});
  },

  dependencyDOT: function(pkgs) {
    var dotSource = "";

    dotSource += "digraph G {\n";

    var pkgNodes = Object.keys(pkgs).reduce(function (nodes, pkgName) {
      var idx = Object.keys(nodes).length;
      var node = `package${idx}`;

      nodes[pkgName] = node;
      return nodes;
    }, {});

    Object.keys(pkgs).forEach(function (pkgName) {
      var node = pkgNodes[pkgName];
      dotSource += `${node} [ label="${pkgName}" ];`;
      dotSource += "\n";
    });

    Object.keys(pkgs).forEach(function (pkgName) {
      var pkgNode = pkgNodes[pkgName];
      var dependentNodes = packageDependencies(pkgName, pkgs)
        .map(function (dep) { return pkgNodes[dep]; });

      if (dependentNodes.length) {
        dotSource += `${pkgNode} -> { ${dependentNodes.join(' ')} };`;
        dotSource += "\n";
      }
    });

    dotSource += "}\n";
    return dotSource;
  },

  traverse: traverse,
  indent: indent,
  runSync: runSync,

  linkTree: linkTree,

  testTraverse: function() {
    var home = process.env.TRUFFLEHOME;
    var pkgs = this.availablePackages(home);
    return testTraverse("truffle-contract", pkgs);
  }
}
