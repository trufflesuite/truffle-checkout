#!/usr/bin/env node
var link = require("./commands/link");
var list = require("./commands/list");
var use = require("./commands/use");
var workon = require("./commands/workon");

require('yargs')
  .command('list', 'List managed packages',
    function() {},
    function(argv) {
      list({ inDir: argv.dir });
      process.exit();
  })
  .command('link', 'Link managed packages',
    function() {},
    function(argv) {
      link({ inDir: argv.dir });
      process.exit();
  })
  .command('init', 'Initialize truffle, pointing to trufflesuite/master',
    function() {},
    function(argv) {
      use({ inDir: argv.dir, packages: [] });
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
        inDir: argv.dir,
        packages: argv._.slice(1),
        fetch: argv.fetch
      });
    }
  )
  .option('dir', { alias: 'd', describe: 'Directory with all the packages' })
  .default('dir', function() { return process.cwd(); }, '`cwd`')
  .help()
  .argv;
