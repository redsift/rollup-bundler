const path = require('path');
const fs = require('fs');
const merge = require('lodash.merge');
const babel = require('rollup-plugin-babel');
const babelHelpers = require('babel-helpers');
const babelrcBuilder = require('babelrc-rollup').default;
const chalk = require('chalk');

const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const progress = require('rollup-plugin-progress');
const cleanup = require('rollup-plugin-cleanup');
const json = require('rollup-plugin-json');
const minify = require('rollup-plugin-babel-minify');
const filesize = require('rollup-plugin-filesize');
const visualizer = require('rollup-plugin-visualizer');
const builtins = require('rollup-plugin-node-builtins');

const zeroConfig = require('../rollup.config.zero');
const cwd = process.cwd();

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

const babelrcPath = path.join(cwd, '.babelrc');
const babelrcExists = fs.existsSync(babelrcPath);

const babelrc = babelrcExists
  ? babelrcBuilder({
      path: babelrcPath,
      // disable `addModuleOptions` as it passes { modules: false } to ALL presets,
      // which causes an error e.g. with the `flow` preset, as it does not know the
      // options and errors out. Make sure to pass `{ modules: false }` to the `env`
      // plugin to allow tree-shaking.
      addModuleOptions: false,
      addExternalHelpersPlugin: true,
    })
  : {
      presets: [
        [
          // NOTE: Resolving 'env' in Babel 6 does not always work, depending on the setup. This will be fixed
          // in Babel 7 (see https://github.com/babel/babel-preset-env/issues/186#issuecomment-297776368). Meanwhile
          // we load the preset from the calling project as a workaround:
          path.join(cwd, 'node_modules', 'babel-preset-env'),
          {
            modules: false,
            // "targets": {
            //   "browsers": ["last 1 versions"]
            // }
          },
        ],
      ],
      // NOTE: we use babel-plugin-transform-runtime to prevent clashes if you include multiple bundles which
      // use 'babel-polyfill' in a consuming app/lib.
      // NOTE: After a lot of frustration and googling this combination of `transform-runtime` and `external-helpers`
      // is working. Using `transform-runtime` to do the helpers part did not work (resulting in `Error: 'default' i
      // not exported by node_modules/babel-runtime/helpers/typeof.js`). Therefore helpers are transformed via the
      // `external-helpers` plugin.
      plugins: ['external-helpers', ['transform-runtime', { helpers: false }]],
      exclude: 'node_modules/**',
      // Therefore runtimeHelpers has to be set: (see https://github.com/rollup/rollup-plugin-babel#helpers)
      runtimeHelpers: true,
      babelrc: false,
    };

if (babelrcExists) {
  console.log(chalk.grey(`\nUsing ${babelrcPath}`));
}

module.exports = function(baseOptions, showConfig = true) {
  if (!baseOptions) {
    baseOptions = zeroConfig;
  }

  if (!baseOptions.input) {
    baseOptions.input = zeroConfig.input;
  }

  if (!baseOptions.output) {
    baseOptions.output = zeroConfig.output;
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

  const {
    pluginConfigs = {},
    output: outputOptions,
    input: inputOptions,
    ...restOptions
  } = baseOptions;
  const {
    json: jsonCfg,
    babel: babelCfg,
    resolve: resolveCfg,
    commonjs: commonjsCfg,
  } = pluginConfigs;

  let babelConfig = babelCfg ? babelCfg : babelrc;

  if (
    (babelConfig &&
      (babelConfig.plugins.includes('transform-runtime') ||
        babelConfig.plugins.includes('babel-plugin-transform-runtime'))) ||
    !!babelConfig.plugins.find(
      p =>
        Array.isArray(p) &&
        p.length &&
        (p[0] === 'transform-runtime' ||
          p[0] === 'babel-plugin-transform-runtime')
    )
  ) {
    babelConfig = Object.assign(babelConfig, { runtimeHelpers: true });
  }
  if (showConfig) {
    console.log(
      chalk.grey(
        '\nBundler configuration:',
        JSON.stringify(baseOptions, null, 4)
      )
    );

    console.log(chalk.grey('babelrc:', JSON.stringify(babelConfig, null, 4)));
  }

  const defaultPlugins = [
    progress(),
    json(jsonCfg ? jsonCfg : { indent: '    ' }),
    builtins(),
    babel(babelConfig),
    resolve(resolveCfg ? resolveCfg : { jsnext: true }),
    commonjs(commonjsCfg ? commonjsCfg : {}),
    cleanup(),
    filesize(),
  ];

  // NOTE: delete non-standard field, otherwise rollup will complain:
  delete baseOptions.pluginConfigs;

  const configs = [];
  const outputs = [
    { format: 'umd', file: _suffixPath(outputOptions.file, 'umd') },
    // NOTE: legacy UMD name for CDN published versions. Codepen.io examples are using
    // this filename convention when loading the bundle from the CDN:
    { format: 'umd', file: _suffixPath(outputOptions.file, 'umd-es2015') },
    { format: 'es', file: _suffixPath(outputOptions.file, 'esm') },
  ];

  outputs.forEach(output => {
    const options = baseOptions.plugins
      ? merge(
          {},
          baseOptions,
          globalOptions,
          { plugins: baseOptions.plugins },
          restOptions,
          {
            output,
          }
        )
      : merge(
          {},
          baseOptions,
          globalOptions,
          { plugins: defaultPlugins },
          {
            output,
          },
          restOptions
        );

    configs.push(options);

    if (options.output.format === 'es') {
      options.plugins.push(visualizer());
      return;
    }

    const minOptions = merge({}, options, {
      output: { file: _suffixPath(output.file, 'min') },
    });

    minOptions.plugins = minOptions.plugins.slice(0);
    minOptions.plugins.push(minify());

    configs.push(minOptions);
  });

  return configs;
};
