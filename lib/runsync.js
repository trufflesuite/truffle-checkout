var spawnSync = require('child_process').spawnSync;
var indent = require("./indent");

module.exports = function runSync(command, args, cwd, logger, quiet) {
  var logger = indent(logger, 2);

  if (quiet !== true) {
    logger.log(`$ ${command} ${ args.join(" ") }`);
  }

  var result = spawnSync(command, args, {
    cwd: cwd,
    env: Object.assign({}, process.env, { PATH: process.env.PATH + ':/usr/local/bin' }),
  });

  // Error executing command (like the command doesn't exist).
  if (result.error) {
    throw result.error;
  }

  // If the command didn't exit properly, show the output and throw.
  if (result.status !== 0) {
    logger.log(result.stdout);
    logger.error(`exit ${result.status}, stderr:`);
    logger.error(`  ${result.stderr}`);

    throw new Error("Command failed. See output above.");
  }

  return result;
}
