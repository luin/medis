'use strict';

import Redis from 'ioredis';
import _ from 'lodash';

export function connect({ config, override }) {
  console.log(config);
  const redis = new Redis(_.assign({}, config, override));
  const activeInstanceKey = this.get('activeInstanceKey');
  return this.update('instances', list => list.map(instance => {
    if (instance.get('key') === activeInstanceKey) {
      const remote = config.name ? `${config.name}/` : (config.sshHost ? `${config.sshHost}/` : '');
      const address = `${config.host}:${config.port}`;
      const title = `${remote}${address}`;
      return instance
        .set('connectionKey', `${config.sshHost || ''}|${config.host}|${config.port}`)
        .set('config', config)
        .set('title', title)
        .set('redis', redis);
    }
    return instance;
  }));
}
