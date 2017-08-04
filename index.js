#!/usr/bin/env node
var link = require("./commands/link");
var list = require("./commands/list");
var use = require("./commands/use");
var switchCmd = require("./commands/switch");
var test = require("./commands/test");
var process = require("process");

require('yargs')
  .command('list', 'List managed packages',
    function() {},
    function(argv) {
      list({ workspace: argv.dir });
      process.exit();
  })
  .command('link', 'Link managed packages',
    function() {},
    function(argv) {
      link({ workspace: argv.dir });
      process.exit();
  })
  .command('init', 'Initialize truffle, pointing to trufflesuite/master',
    function() {},
    function(argv) {
      use({ workspace: argv.dir, packages: [] });
    }
  )
  .command('use', 'Initialize and use a specific set of truffle modules',
    function(yargs) {
      return yargs
        .option('fetch', {
          alias: 'f',
          describe: 'whether or not to fetch the repo before checking out',
          type: 'boolean'
        });
    },
    function(argv) {
      use({
        workspace: argv.dir,
        packages: argv._.slice(1),
        fetch: argv.fetch
      });
    }
  )
  .command('test', "Run all tests in packages given a sub-graph specification",
    function(yargs) {
      return yargs
        .boolean('strict-children');
    },
    function(argv) {
      test({
        workspace: argv.dir,
        packagesSpec: argv._.slice(1),
        strictChildren: argv['strict-children']
      });
    }
  )
  .command('switch <org> <branch>', 'Use a specific remote/branch environment',
    function() {},
    function(argv) {
      switchCmd({
        workspace: argv.dir,
        orgName: argv.org,
        branchName: argv.branch
      });
  })
  .option('dir', { alias: 'd', describe: 'Directory with all the packages' })
  .default('dir', function() { return process.cwd(); }, '`cwd`')
  .help()
  .argv;
