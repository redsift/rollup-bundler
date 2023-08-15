const path = require('path');
const pascalCase = require('pascal-case');
const chalk = require('chalk');

const cwd = process.cwd();
const targetPkg = require(path.join(cwd, 'package.json'));

const targetName = targetPkg.name.includes('/') ? targetPkg.name.split('/')[1] : targetPkg.name;

console.log(chalk.grey('Using project name:', targetName));

module.exports = {
    input: path.join(cwd, 'src', 'index.js'),
    output: {
        file: path.join(cwd, 'dist', `${targetName}.js`),
        name: pascalCase(targetName),
    },
};
