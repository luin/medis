'use strict';

import React from 'react';
import commands from 'redis-commands';
import { clone } from 'lodash';

require('./Config.scss');

class Config extends React.Component {
  constructor(props) {
    super(props);
    this.groups = [
      {
        name: 'General',
        configs: [
          { name: 'port', type: 'number' },
          { name: 'bind' },
          { name: 'unixsocket' },
          { name: 'unixsocketperm', type: 'number' },
          { name: 'daemonize', type: 'boolean' },
          { name: 'pidfile' },
          { name: 'tcp-backlog', type: 'number' },
          { name: 'tcp-keepalive', type: 'number' },
          { name: 'timeout', type: 'number' },
          { name: 'databases', type: 'number' }
        ]
      },
      {
        name: 'Logging',
        configs: [
          { name: 'loglevel', type: ['debug', 'verbose', 'notice', 'warning'] },
          { name: 'logfile' },
          { name: 'syslog-enabled', type: 'boolean' },
          { name: 'syslog-ident' },
          { name: 'syslog-facility' },
        ]
      },
      {
        name: 'Snap Shotting',
        configs: [
          { name: 'dbfilename' },
          { name: 'dir' },
          { name: 'save' },
          { name: 'stop-writes-on-bgsave-error', type: 'boolean' },
          { name: 'rdbcompression', type: 'boolean' },
          { name: 'rdbchecksum', type: 'boolean' }
        ]
      },
      {
        name: 'Replication',
        configs: [
          { name: 'slaveof' },
          { name: 'masterauth' },
          { name: 'slave-serve-stale-data', type: 'boolean' },
          { name: 'slave-read-only', type: 'boolean' },
          { name: 'repl-diskless-sync', type: 'boolean' },
          { name: 'repl-diskless-sync-delay', type: 'number' },
          { name: 'repl-ping-slave-period', type: 'number' },
          { name: 'repl-timeout', type: 'number' },
          { name: 'repl-disable-tcp-nodelay', type: 'boolean' },
          { name: 'repl-backlog-size' },
          { name: 'repl-backlog-ttl', type: 'number' },
          { name: 'slave-priority', type: 'number' },
          { name: 'min-slaves-to-write', type: 'number'},
          { name: 'min-slaves-max-lag', type: 'number'},
        ]
      },
      {
        name: 'Security',
        configs: [
          { name: 'requirepass' },
          { name: 'rename-command' }
        ]
      },
      {
        name: 'Limits',
        configs: [
          { name: 'maxclients' },
          { name: 'maxmemory' },
          { name: 'maxmemory-policy', type: ['noeviction', 'volatile-lru', 'allkeys-lru', 'volatile-random', 'allkeys-random', 'volatile-ttl'] },
          { name: 'maxmemory-samples', type: 'number' }
        ]
      },
      {
        name: 'Append Only Mode',
        configs: [
          { name: 'appendonly', type: 'boolean' },
          { name: 'appendfilename' },
          { name: 'appendfsync', type: ['everysec', 'always', 'no'] },
          { name: 'no-appendfsync-on-rewrite', type: 'boolean' },
          { name: 'auto-aof-rewrite-percentage', type: 'number' },
          { name: 'auto-aof-rewrite-min-size' },
          { name: 'aof-load-truncated', type: 'number' }
        ]
      },
      {
        name: 'LUA Scripting',
        configs: [
          { name: 'lua-time-limit', type: 'number' }
        ]
      },
      {
        name: 'Cluster',
        configs: [
          { name: 'cluster-enabled', type: 'boolean' },
          { name: 'cluster-config-file' },
          { name: 'cluster-node-timeout', type: 'number' },
          { name: 'cluster-slave-validity-factor', type: 'nubmer' },
          { name: 'cluster-migration-barrier', type: 'number' },
          { name: 'cluster-require-full-coverage', type: 'boolean' },
        ]
      },
      {
        name: 'Slow Log',
        configs: [
          { name: 'slowlog-log-slower-than', type: 'number' },
          { name: 'slowlog-max-len', type: 'number' }
        ]
      },
      {
        name: 'Latency Monitor',
        configs: [
          { name: 'latency-monitor-threshold',type: 'number' }
        ]
      },
      {
        name: 'Event Notification',
        configs: [
          { name: 'notify-keyspace-events' }
        ]
      },
      {
        name: 'Advanced Config',
        configs: [
          { name: 'hash-max-ziplist-entries', type: 'number' },
          { name: 'hash-max-ziplist-value', type: 'number' },
          { name: 'list-max-ziplist-entries', type: 'number' },
          { name: 'list-max-ziplist-value', type: 'number' },
          { name: 'set-max-intset-entries', type: 'number' },
          { name: 'zset-max-ziplist-entries', type: 'number' },
          { name: 'zset-max-ziplist-value', type: 'number' },
          { name: 'hll-sparse-max-bytes', type: 'number' },
          { name: 'activerehashing', type: 'boolean' },
          { name: 'client-output-buffer-limit' },
          { name: 'hz', type: 'number' },
          { name: 'aof-rewrite-incremental-fsync', type: 'boolean' }
        ]
      }
    ];
    this.state = { groups: [], unsavedConfigs: {} };
    this.load();
  }

  load() {
    this.props.redis.config('get', '*').then(config => {
      const configs = {};

      for (let i = 0; i < config.length -1; i += 2) {
        configs[config[i]] = config[i + 1];
      }

      const groups = clone(this.groups, true).map(g => {
        g.configs = g.configs.map(c => {
          if (typeof configs[c.name] !== 'undefined') {
            c.value = configs[c.name];
            delete configs[c.name];
          }
          return c;
        }).filter(c => typeof c.value !== 'undefined');
        return g;
      }).filter(g => g.configs.length);

      if (Object.keys(configs).length) {
        groups.push({ name: 'Other', configs: Object.keys(configs).map(key => {
          return {
            name: key,
            value: configs[key]
          }
        }) });
      }

      this.setState({ groups, unsavedConfigs: {} });
    });
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    this.props.redis.removeAllListeners('select', this.onSelectBinded);
  }

  renderGroup(group) {
    return <div
      key={group.name}
      className="config-group"
    >
      <h3>{group.name}</h3>
      { group.configs.map(this.renderConfig, this) }
    </div>
  }

  change({ name, value }) {
    this.state.unsavedConfigs[name] = value;
    this.setState({
      groups: this.state.groups,
      unsavedConfigs: this.state.unsavedConfigs
    });
  }

  renderConfig(config) {
    let input;
    if (config.type === 'boolean' &&
        (config.value === 'yes' || config.value === 'no')) {
      input = <input type="checkbox" checked={config.value === 'yes'} onChange={e => {
        config.value = e.target.checked ? 'yes' : 'no';
        this.change(config);
      }} />;
    } else if (config.type === 'number' && String(parseInt(config.value, 10)) === config.value) {
      input = <input type="number" value={config.value} onChange={e => {
        config.value = e.target.value;
        this.change(config);
      }} />;
    } else if (Array.isArray(config.type) && config.type.indexOf(config.value) !== -1) {
      input = <select value={config.value} onChange={e => {
        config.value = e.target.value;
        this.change(config);
      }}>
        {config.type.map(option => <option>{option}</option>)}
      </select>;
    } else {
      input = <input type="text" value={config.value} onChange={e => {
        config.value = e.target.value;
        this.change(config);
      }} />;
    }
    return <div
      className="nt-form-row"
      key={config.name}
    >
      <label htmlFor={config.name}>{config.name}</label>
      { input }
      <div className="description">{config.description}</div>
    </div>
  }

  render() {
    return <div style={this.props.style} className="Config">
      <div className="wrapper">
        <form>
          {
            this.state.groups.map(this.renderGroup, this)
          }
        </form>
      </div>
    </div>;
  }
}

export default Config;
