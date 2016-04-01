'use strict';

const Promise = require('bluebird');
const sudo = require('electron-sudo');

function run(cmd) {
    return new Promise((resolve, reject) => {
        sudo.exec(cmd, {}, (error, data) => {
            if (error) {
                reject(error);
            }

            resolve(data.toString());
        });
    });
}

const _getDevice = function () {
    return new Promise((resolve, reject) => {
        run('ifconfig')
            .then((output) => {
                const re = /^([^\t:]+):(?:[^\n]|\n\t)*status: active/mg;
                const devices = [];
                let md;

                while ((md = re.exec(output)) !== null) {
                    devices.push(md[1]);
                }
                devices.length ? resolve(devices) : reject();
            })
            .catch(reject);
    });
};

const _getCommands = function () {
    return new Promise((resolve, reject) => {
        if (process.platform !== 'win32') {
            _getDevice()
                .then((devices) => {
                    run('networksetup -listallhardwareports')
                        .then((output) => {
                            const cmds = [];
                            const setups = [
                                'networksetup -setwebproxy "_service" _host _port',
                                'networksetup -setsecurewebproxy "_service" _host _port',
                                'networksetup -setwebproxystate "_service" on',
                                'networksetup -setsecurewebproxystate "_service" on'
                            ];

                            for (let i = 0; i < devices.length; i++) {
                                const re = new RegExp("Hardware Port: (.+?)\\nDevice: " + devices[i], 'm');
                                let md;

                                if (md = re.exec(output)) {
                                    setups.map(item => cmds.push(item.replace('_service', md[1])));
                                }
                            }
                            cmds.length ? resolve(cmds) : reject();
                        })
                        .catch(reject);
                }).catch(reject);
        } else {
            resolve([
                'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f',
                'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d _host:_port /f',
                'netsh winhttp import proxy source=ie',
                'netsh winhttp set proxy _host:_port'
            ]);
        }
    });
};

exports.setProxyOn = function (host, port) {
    return new Promise((resolve, reject) => {
        _getCommands()
            .then((cmds) => {
                Promise.reduce(cmds, (_, cmd) => {
                    cmd = cmd.replace('_host', host)
                        .replace('_port', port);
                    return run(cmd);
                }, null).then(resolve).catch(reject);
            });
    });
};

exports.setProxyOff = function () {
    const cmds = [];

    if (process.platform !== 'win32') {
        cmds.push('networksetup -setwebproxystate WI-FI off');
        cmds.push('networksetup -setsecurewebproxystate WI-FI off');
    } else {
        cmds.push('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /f');
        cmds.push('reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /f');
        cmds.push('netsh winhttp reset proxy');
    }

    return Promise.reduce(cmds, (_, cmd) => run(cmd), null);
};