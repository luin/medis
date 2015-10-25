'use strict';

import { Client } from 'ssh2';
import net from 'net';

const actions = {
  connect(config) {
    return dispatch => {
      if (config.ssh) {
        const conn = new Client();
        conn.on('ready', () => {
          const server = net.createServer(function (sock) {
            conn.forwardOut(sock.remoteAddress, sock.remotePort, '127.0.0.1', 6379, function (err, stream) {
              if (err) {
                return sock.end();
              }
              sock.pipe(stream).pipe(sock);
            });
          }).listen(0, function () {
            dispatch({
              type: 'connect',
              data: { config, override: { host: '127.0.0.1', port: server.address().port } }
            });
          });
        }).connect({
          host: config.sshHost,
          port: config.sshPort || 22,
          username: config.sshUser,
          privateKey: config.sshKey,
          passphrase: config.sshKeyPassphrase
        });
      } else {
        dispatch({ type: 'connect', data: { config } });
      }

    };
  }
};

export default function (type, data, callback) {
  if (actions[type]) {
    return actions[type](data, callback);
  }
  if (typeof data === 'function') {
    return { type, callback: data };
  }
  return { type, data, callback };
}
