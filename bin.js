#!/usr/bin/env node

//node bin.js -h localhost:8008
//node bin.js -d

const argv = require('optimist').argv;
const proxy = require('./index');

if (argv.h) {
    const p = argv.h.split(':');

    proxy.setProxyOn(p[0], p[1])
        .then(() => console.log('Proxy on ok!'))
        .catch(() => console.log('fail'));
} else if (argv.d) {
    proxy.setProxyOff()
        .then(() => console.log('Proxy off ok!'))
        .catch(() => console.log('fail'));
}
