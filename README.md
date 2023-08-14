# rollup-bundler

## Installation

```bash
npm install @redsift/rollup-bundler @babel/runtime -D
```

## Usage

### CLI

From the command line use either

`npx rollup-bundler` for zero config usage or

`npx rollup-bundler my-config-file.js` to apply a custom configuration.

### `package.json`

You can add the bundler to your `package.json` file with a script like this (name is arbitrary):

```
"scripts": {
  ...
  "build": "rollup-bundler"
}
```

or with a custom configuration:

```
"scripts": {
  ...
  "build": "rollup-bundler my-config-file.js"
}
```

## Zero Config Usage

This module has a 'zero config' setup which takes takes a ES5/ES2015+

`./src/index.js`

as input and outputs

```
./dist
├── dist/my-module.esm.js      <--- ESM module file with ES5 syntax
├── dist/my-module.esm.minjs   <--- minified version of the above (for the `module` field in `package.json`)
├── dist/my-module.umd.js      <--- UMD module file with ES5 syntax
├── dist/my-module.umd.min.js  <--- minified version of the above (for the `main` field in `package.json`)
```

The `my-module` name is derived from the `package.json` `name` field.

You don't need a `.babelrc` file, but `babel-preset-env` and `babel-plugin-external-helpers` need to be installed as (dev) dependencies.

## Custom Usage

To use a different input file and/or output to a different folder create a configuration file, e.g. `bundle.config.js`:

```js
module.exports = {
  input: `./index.js`,
  output: {
    file: "anotherdist/my-different-module-name.js",
    name: "MyDifferentModuleName"
  },
  pluginConfigs: {
    commonjs: {
      namedExports: {
        "node_modules/a-common-js-module-with-unsupported-export/index.min.js": [
          "MyCustomNamedExport"
        ]
      }
    }
  }
};
```
The config format follows rollup's configuration for `input` and `output` fields but adds a `pluginConfig` field to specify custom options for rollup plugins used by the bundler. Each named plugin key (e.g. `commonjs`) is used verbatim as options object for the respective rollup plugin. This is the list of configurable plugins:

* json
* babel
* resolve
* commonjs

The above custom configuration will produce the following output:

```
./dist
├── anotherdist/my-different-module-name.esm.js      <--- ESM module file with ES5 syntax
├── anotherdist/my-different-module-name.esm.minjs   <--- minified version of the above (for the `module` field in `package.json`)
├── anotherdist/my-different-module-name.umd.js      <--- UMD module file with ES5 syntax
├── anotherdist/my-different-module-name.umd.min.js  <--- minified version of the above (for the `main` field in `package.json`)
```

## Use your own `.babelrc`

If the root folder of your project contains a `.babelrc` the bundler will use it. The bundler will also add the [`external-helpers`](https://github.com/rollup/rollup-plugin-babel#configuring-babel) plugin automatically to optimize the bundle.

If you are experiencing erros related to the `node_modules/babel-runtime` package and are using using the `transform-runtime` plugin please make sure to disable the `helpers` option like this in your `.babelrc`:

```
{
  "presets": ...,
  "plugins": [
    ["@babel/transform-runtime", { "helpers": false }]
  ]
}
```

The optimization of the helpers will be done by the `external-helpers` plugin.

## Bundle visualization

The bundler creates a visual overview of the output bundle to see which packages contribute to the filesize. The output is created as `stats.html`.

> This project is based on [rollup-config-builder](https://github.com/Donov4n/rollup-config-builder).
