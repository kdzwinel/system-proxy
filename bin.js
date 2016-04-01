#!/usr/bin/env node

//node bin.js -h localhost:8008
//node bin.js -d

const argv = require('optimist').argv;
const proxy = require('./index');

if (argv.h) {
    const p = argv.h.split(':');

    proxy.setProxyOn(p[0], p[1])
        .then(() => console.log('Proxy enabled.'))
        .catch(() => console.log('Failure.'));
} else if (argv.d) {
    proxy.setProxyOff()
        .then(() => console.log('Proxy disabled.'))
        .catch(() => console.log('Failure.'));
}
