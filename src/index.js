const pkg = require('../package.json');
const createConfig = require('./create-config');
const createBundles = require('./create-bundles');
const path = require('path');
const chalk = require('chalk');

const showConfig = true;

console.log(chalk.grey(`Starting bundler v${pkg.version} in ${process.cwd()}`));

const rollupConfigFile = process.argv[2];

const baseOptions = rollupConfigFile
    ? require(path.join(process.cwd(), rollupConfigFile))
    : require('../rollup.config.zero.js');

if (showConfig) {
    console.log(
        chalk.grey('\nConfiguration:', JSON.stringify(baseOptions, null, 4))
    );

    if (!rollupConfigFile) {
        console.log(chalk.grey('(zero config setup)'));
    }
}

const rollupConfig = createConfig(baseOptions);

createBundles(rollupConfig);
