const pkg = require('../package.json');
const createConfig = require('./create-config');
const createBundles = require('./create-bundles');
const path = require('path');
const chalk = require('chalk');

module.exports = function rollupBundler({
  showConfig = true,
  defaultRollupConfigFile = '../rollup.config.zero.js',
}) {
  console.log(
    chalk.grey(`\nStarting bundler v${pkg.version} in ${process.cwd()}`)
  );

  const rollupConfigFile = process.argv[2];

  const baseOptions = rollupConfigFile
    ? require(path.join(process.cwd(), rollupConfigFile))
    : require(defaultRollupConfigFile);

  const rollupConfig = createConfig(baseOptions, showConfig);

  createBundles(rollupConfig);
};
