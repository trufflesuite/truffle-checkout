#!/usr/bin/env node
var process = require("process");

var link = require("./commands/link");
var list = require("./commands/list");
var use = require("./commands/use");
var workon = require("./commands/workon");
var test = require("./commands/test");

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
  .command('workon <org> <branch>', 'Use a specific remote/branch environment',
    function() {},
    function(argv) {
      workon({
        inDir: argv.dir,
        orgName: argv.org,
        branchName: argv.branch
      });
  })
  .command('test', "Run all tests in packages given a sub-graph specification",
    function() {},
    function(argv) {
      test({
        workspace: argv.dir,
        packagesSpec: argv._.slice(1),
      });
    }
  )
  .command('*', 'Initialize and use a specific set of truffle modules',
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
  .option('workspace', { alias: 'w', describe: 'The directory with all the packages' })
  .default('workspace', function() { return process.cwd(); }, '`cwd`')
  .help()
  .argv;
