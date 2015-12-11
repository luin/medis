'use strict';

import { Client } from 'ssh2';
import net from 'net';
import Redis from 'ioredis';
import _ from 'lodash';

const actions = {
  connect(config) {
    return dispatch => {
      if (config.ssh) {
        dispatch({ type: 'updateConnectStatus', data: 'SSH connecting...' });
        const conn = new Client();
        conn
        .on('ready', () => {
          const server = net.createServer(function (sock) {
            conn.forwardOut(sock.remoteAddress, sock.remotePort, config.host, config.port, function (err, stream) {
              if (err) {
                return sock.end();
              }
              sock.pipe(stream).pipe(sock);
            });
          }).listen(0, function () {
            handleRedis(config, { host: '127.0.0.1', port: server.address().port });
          });
        })
        .on('error', err => {
          dispatch({ type: 'disconnect' });
          alert(`SSH Error: ${err.message}`);
        });

        try {
          conn.connect({
            host: config.sshHost,
            port: config.sshPort || 22,
            username: config.sshUser,
            privateKey: config.sshKey,
            passphrase: config.sshKeyPassphrase
          });
        } catch (err) {
          dispatch({ type: 'disconnect' });
          alert(`SSH Error: ${err.message}`);
        }
      } else {
        handleRedis(config);
      }

      function handleRedis(config, override) {
        dispatch({ type: 'updateConnectStatus', data: 'Redis connecting...' });
        const redis = new Redis(_.assign({}, config, override, {
          showFriendlyErrorStack: true,
          retryStrategy() {
            return false;
          }
        }));
        redis.defineCommand('setKeepTTL', {
          numberOfKeys: 1,
          lua: 'local ttl = redis.call("pttl", KEYS[1]) if ttl > 0 then return redis.call("SET", KEYS[1], ARGV[1], "PX", ttl) else return redis.call("SET", KEYS[1], ARGV[1]) end'
        });
        redis.defineCommand('lremindex', {
          numberOfKeys: 1,
          lua: 'local FLAG = "$$#__@DELETE@_REDIS_@PRO@__#$$" redis.call("lset", KEYS[1], ARGV[1], FLAG) redis.call("lrem", KEYS[1], 1, FLAG)'
        });
        redis.once('connect', function () {
          redis.ping((err, res) => {
            if (err) {
              if (err.message === 'Ready check failed: NOAUTH Authentication required.') {
                err.message = 'Redis Error: Access denied. Please double-check your password.';
              }
              alert(err.message);
              dispatch({ type: 'disconnect' });
              return;
            }
            const version = redis.serverInfo.redis_version;
            if (version && version.length === 5) {
              const versionNumber = Number(version[0] + version[2]);
              if (versionNumber < 28) {
                alert('Medis only supports Redis >= 2.8 because servers older than 2.8 don\'t support SCAN command, which means it not possible to access keys without blocking Redis.');
                dispatch({ type: 'disconnect' });
                return;
              }
            }
            dispatch({ type: 'connect', data: { redis, config } });
          })
        });
        redis.once('end', function () {
          dispatch({ type: 'disconnect' });
          alert('Redis Error: Connection failed');
        });
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
