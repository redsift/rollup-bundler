const rollup = require('rollup');
const chalk = require('chalk');

async function createBundle(config) {
    const inputOptions = { input: config.input, ...config };
    const outputOptions = config.output;

    const bundle = await rollup.rollup(inputOptions);

    //   console.log(bundle.imports); // an array of external dependencies
    //   console.log(bundle.exports); // an array of names exported by the entry point
    //   console.log(bundle.modules); // an array of module objects

    // generate code and a sourcemap
    const { code, map } = await bundle.generate(outputOptions);

    // console.log('output', JSON.stringify(outputOptions, null, 4));

    // or write the bundle to disk
    await bundle.write(outputOptions);
}

async function createBundles(rollupConfig) {
    if (Array.isArray(rollupConfig)) {
        for (let idx = 0; idx < rollupConfig.length; idx++) {
            const config = rollupConfig[idx];

            await createBundle(config);
        }
    } else {
        createBundle(rollupConfig);
    }
}

module.exports = createBundles;
