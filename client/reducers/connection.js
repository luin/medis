'use strict';

import Redis from 'ioredis';
import { Client } from 'ssh2';
import net from 'net';

export function connect(config) {
  if (config.ssh) {
    const conn = new Client();
    conn.on('ready', () => {
      net.createServer(function(sock) {
        conn.forwardOut(sock.remoteAddress, sock.remotePort, '127.0.0.1', 6379, function(err, stream) {
          console.log(err, stream);
          if (err) return sock.end();
          sock.pipe(stream).pipe(sock);
        });
      }).listen(16120, function() {
        console.log('Listening on 3306 for connections to forward');
      });
    }).connect({
      host: config.sshHost,
      port: config.sshPort || 22,
      username: config.sshUser,
      privateKey: config.sshKey,
      passphrase: config.sshKeyPassphrase
    });
  }

  config.port = 16120;
  config.host = '127.0.0.1';

  return connectRedis.call(this, config);
}

function connectRedis(redisConfig) {
  const redis = new Redis(redisConfig);
  const activeInstanceKey = this.get('activeInstanceKey');
  return this
  .update('instances', list => list.map(instance => {
    if (instance.get('key') === activeInstanceKey) {
      return instance.set('connectionKey', 'localhost:6379').set('redis', redis);
    }
    return instance;
  }));
}
