const path = require('path');
const merge = require('lodash.merge');
const babel = require('rollup-plugin-babel');
const babelHelpers = require('babel-helpers');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const progress = require('rollup-plugin-progress');
const cleanup = require('rollup-plugin-cleanup');
const json = require('rollup-plugin-json');
const minify = require('rollup-plugin-babel-minify');

const _suffixPath = (p, sffx) => {
    const parts = path.parse(p);
    parts.name = `${parts.name}.${sffx}`;
    delete parts.base;

    return path.format(parts);
};

const globalOptions = {
    output: {
        exports: 'named',
    },
};


const babelrc = {
    presets: [["env", {
        "modules": false,
        // "targets": {
        //   "browsers": ["last 1 versions"]
        // }
      }]],
    plugins: ['external-helpers'],
    exclude: 'node_modules/**',
    // NOTE: we use babel-plugin-transform-runtime to prevent clashes if 'babel-polyfill' is included via multiple bundles.
    // Therefore runtimeHelpers has to be set: (see https://github.com/rollup/rollup-plugin-babel#helpers)
    runtimeHelpers: true,
    babelrc: false,
};

module.exports = function(baseOptions) {
    if (!baseOptions) {
        baseOptions = require('./zero-config');
    }

    if (!baseOptions.input) {
        console.log(chalk.red('\n\nConfiguration error:'));
        console.log(chalk.red('--------------------'));
        console.log(
            chalk.red(
                "\n  > You must specify an 'input' field if your entry point is different from './src/index.js'!\n\n"
            )
        );

        return;
    }

    baseOptions = Object.assign(
        { output: { file: null, name: null } },
        baseOptions
    );

    if (!baseOptions.output.file) {
        console.log(chalk.red('\n\nConfiguration error:'));
        console.log(chalk.red('--------------------'));
        console.log(
            chalk.red("\n  > You have to specify an 'output.file' field!\n\n")
        );

        return;
    }

    const { namedExports } = baseOptions;

    const defaultPlugins = [
        progress(),
        json({ indent: '    ' }),
        babel(babelrc),
        resolve(),
        commonjs(namedExports ? { namedExports } : {}),
        cleanup(),
    ];

    delete baseOptions.namedExports;

    const configs = [];
    const outputs = [
        { format: 'umd', file: _suffixPath(baseOptions.output.file, 'umd') },
        { format: 'es', file: _suffixPath(baseOptions.output.file, 'esm') },
    ];

    outputs.forEach(output => {
        const options = false //baseOptions.plugins
            ? merge({}, baseOptions, globalOptions, baseOptions.plugins, {
                  output,
              })
            : merge(
                  {},
                  baseOptions,
                  globalOptions,
                  { plugins: defaultPlugins },
                  {
                      output,
                  }
              );

        configs.push(options);

        const minOptions = merge({}, options, {
            output: { file: _suffixPath(output.file, 'min') },
        });

        minOptions.plugins = minOptions.plugins.slice(0);
        minOptions.plugins.push(minify());
        configs.push(minOptions);
    });

    return configs;
};
