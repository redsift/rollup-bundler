# rollup-bundler

## Installation

```bash
yarn add --dev @redsift/rollup-bundler
yarn add --dev babel-preset-env babel-plugin-external-helpers
```

## Zero Config Usage

This module has a 'zero config' setup. This default configuration takes `./src/index.js` as input and outputs

```
./dist
├── dist/my-module.esm.js      <--- ESM module file with ES5 syntax
├── dist/my-module.esm.minjs   <--- minified version of the above (for the `module` field in `package.json`)
├── dist/my-module.umd.js      <--- UMD module file with ES5 syntax
├── dist/my-module.umd.min.js  <--- minified version of the above (for the `main` field in `package.json`)
```

The `my-module` name is derived from the `package.json` `name` field.

You don't need a `.babelrc` file, but `babel-preset-env` and `babel-plugin-external-helpers` need to be installed as dev dependencies.

## Custom Usage

To use a different input file and/or output to a different folder you have to create a configuration file, e.g. `bundle.config.js`:

```js
module.exports = {
  input: `./index.js`,
  output: {
    file: 'anotherdist/my-different-module-name.js',
    name: 'MyDifferentModuleName',
  },
  namedExports: {
    'node_modules/a-common-js-module-with-unsupported-export/index.min.js': [
      'MyCustomNamedExport',
    ],
  },
};
```

You can use the `namedExport` field to specify custom named exports from modules where the `rollup-plugin-commonjs` plugin can't create a named export from. The syntax the same as described [here](https://github.com/rollup/rollup-plugin-commonjs#custom-named-exports). The field is used verbatim as options object for the `commonjs` rollup module.

The above custom configuratino will produce the following output:

```
./dist
├── anotherdist/my-different-module-name.esm.js      <--- ESM module file with ES5 syntax
├── anotherdist/my-different-module-name.esm.minjs   <--- minified version of the above (for the `module` field in `package.json`)
├── anotherdist/my-different-module-name.umd.js      <--- UMD module file with ES5 syntax
├── anotherdist/my-different-module-name.umd.min.js  <--- minified version of the above (for the `main` field in `package.json`)
```

This project is based on [rollup-config-builder](https://github.com/Donov4n/rollup-config-builder).