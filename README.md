# system-proxy

Set system proxy for mac & windows platform.

**This version is adjusted for electron apps - it will use GUI prompt to ask user for permissions.**

## Installation

     npm install system-proxy

## Usage

### API

```javascript
var proxy = require('system-proxy');

proxy.setProxyOn(host, port)
    .then(() => console.log('Proxy is ON'))
    .catch(() => console.log('Failure'));

proxy.setProxyOff()
    .then(() => console.log('Proxy is OFF'))
    .catch(() => console.log('Failure'));
```

### Util

```shell
# set web-proxy
system-proxy -h localhost:8080

# disable web-proxy
system-proxy -d
```
