#!/usr/bin/env node

/* globals process */
const rollupBundler = require('./index');

const rollupConfigFile = process.argv.length >= 2 ? process.argv[2] : null;

rollupBundler({ rollupConfigFile });

