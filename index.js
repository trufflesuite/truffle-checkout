#!/usr/bin/env node
var link = require("./commands/link");
var list = require("./commands/list");
var use = require("./commands/use");
var switchCmd = require("./commands/switch");
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
      lint({ workspace: argv.dir });
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
