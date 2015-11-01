'use strict';

export function connect({ redis, config }) {
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

export function updateConnectStatus(status) {
  const activeInstanceKey = this.get('activeInstanceKey');
  return this.update('instances', list => list.map(instance => {
    if (instance.get('key') === activeInstanceKey) {
      return instance.set('connectStatus', status);
    }
    return instance;
  }));
}
