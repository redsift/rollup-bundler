const pkg = require('../package.json');
const createConfig = require('./create-config');
const createBundles = require('./create-bundles');
const path = require('path');
const kleur = require('kleur');

console.log(
  kleur.yellow.underline(`\nIf you are calling the bundler via the src/index.js file please see https://github.com/redsift/rollup-bundler#usage on how to use it correctly. src/index.js support is discontinued.`)
);

module.exports = function rollupBundler({
  showConfig = true,
  defaultRollupConfigFile = '../rollup.config.zero.js',
}) {
  console.log(
    kleur.gray(`\nStarting bundler v${pkg.version} in ${process.cwd()}`)
  );

  const rollupConfigFile = process.argv[2];

  const baseOptions = rollupConfigFile
    ? require(path.join(process.cwd(), rollupConfigFile))
    : require(defaultRollupConfigFile);

  const rollupConfig = createConfig(baseOptions, showConfig);

  createBundles(rollupConfig);
};
