'use strict'

import React from 'react'
import clone from 'lodash.clone'

require('./index.scss')

class Config extends React.Component {
  constructor(props) {
    super(props)
    this.writeableFields = [
      'dbfilename',
      'requirepass',
      'masterauth',
      'maxclients',
      'appendonly',
      'save',
      'dir',
      'client-output-buffer-limit',
      'notify-keyspace-events',
      'rdbcompression',
      'repl-disable-tcp-nodelay',
      'repl-diskless-sync',
      'cluster-require-full-coverage',
      'aof-rewrite-incremental-fsync',
      'aof-load-truncated',
      'slave-serve-stale-data',
      'slave-read-only',
      'activerehashing',
      'stop-writes-on-bgsave-error',
      'lazyfree-lazy-eviction',
      'lazyfree-lazy-expire',
      'lazyfree-lazy-server-del',
      'slave-lazy-flush',
      'tcp-keepalive',
      'maxmemory-samples',
      'timeout',
      'auto-aof-rewrite-percentage',
      'auto-aof-rewrite-min-size',
      'hash-max-ziplist-entries',
      'hash-max-ziplist-value',
      'list-max-ziplist-entries',
      'list-max-ziplist-value',
      'list-max-ziplist-size',
      'list-compress-depth',
      'set-max-intset-entries',
      'zset-max-ziplist-entries',
      'zset-max-ziplist-value',
      'hll-sparse-max-bytes',
      'lua-time-limit',
      'slowlog-log-slower-than',
      'slowlog-max-len',
      'latency-monitor-threshold',
      'repl-ping-slave-period',
      'repl-timeout',
      'repl-backlog-ttl',
      'repl-diskless-sync-delay',
      'slave-priority',
      'min-slaves-to-write',
      'min-slaves-max-lag',
      'cluster-node-timeout',
      'cluster-migration-barrier',
      'cluster-slave-validity-factor',
      'hz',
      'watchdog-period',
      'maxmemory',
      'repl-backlog-size',
      'loglevel',
      'maxmemory-policy',
      'appendfsync'
    ]
    this.groups = [
      {
        name: 'General',
        configs: [
          {name: 'port', type: 'number'},
          {name: 'bind'},
          {name: 'unixsocket'},
          {name: 'unixsocketperm', type: 'number'},
          {name: 'daemonize', type: 'boolean'},
          {name: 'pidfile'},
          {name: 'tcp-backlog', type: 'number'},
          {name: 'tcp-keepalive', type: 'number'},
          {name: 'timeout', type: 'number'},
          {name: 'databases', type: 'number'}
        ]
      },
      {
        name: 'Logging',
        configs: [
          {name: 'loglevel', type: ['debug', 'verbose', 'notice', 'warning']},
          {name: 'logfile'},
          {name: 'syslog-enabled', type: 'boolean'},
          {name: 'syslog-ident'},
          {name: 'syslog-facility'}
        ]
      },
      {
        name: 'Snap Shotting',
        configs: [
          {name: 'dbfilename'},
          {name: 'dir'},
          {name: 'save'},
          {name: 'stop-writes-on-bgsave-error', type: 'boolean'},
          {name: 'rdbcompression', type: 'boolean'},
          {name: 'rdbchecksum', type: 'boolean'}
        ]
      },
      {
        name: 'Replication',
        configs: [
          {name: 'slaveof'},
          {name: 'masterauth'},
          {name: 'slave-serve-stale-data', type: 'boolean'},
          {name: 'slave-read-only', type: 'boolean'},
          {name: 'repl-diskless-sync', type: 'boolean'},
          {name: 'repl-diskless-sync-delay', type: 'number'},
          {name: 'repl-ping-slave-period', type: 'number'},
          {name: 'repl-timeout', type: 'number'},
          {name: 'repl-disable-tcp-nodelay', type: 'boolean'},
          {name: 'repl-backlog-size'},
          {name: 'repl-backlog-ttl', type: 'number'},
          {name: 'slave-priority', type: 'number'},
          {name: 'min-slaves-to-write', type: 'number'},
          {name: 'min-slaves-max-lag', type: 'number'}
        ]
      },
      {
        name: 'Security',
        configs: [
          {name: 'requirepass'},
          {name: 'rename-command'}
        ]
      },
      {
        name: 'Limits',
        configs: [
          {name: 'maxclients'},
          {name: 'maxmemory'},
          {name: 'maxmemory-policy', type: ['noeviction', 'volatile-lru', 'allkeys-lru', 'volatile-random', 'allkeys-random', 'volatile-ttl']},
          {name: 'maxmemory-samples', type: 'number'}
        ]
      },
      {
        name: 'Append Only Mode',
        configs: [
          {name: 'appendonly', type: 'boolean'},
          {name: 'appendfilename'},
          {name: 'appendfsync', type: ['everysec', 'always', 'no']},
          {name: 'no-appendfsync-on-rewrite', type: 'boolean'},
          {name: 'auto-aof-rewrite-percentage', type: 'number'},
          {name: 'auto-aof-rewrite-min-size'},
          {name: 'aof-load-truncated', type: 'number'}
        ]
      },
      {
        name: 'LUA Scripting',
        configs: [
          {name: 'lua-time-limit', type: 'number'}
        ]
      },
      {
        name: 'Cluster',
        configs: [
          {name: 'cluster-enabled', type: 'boolean'},
          {name: 'cluster-config-file'},
          {name: 'cluster-node-timeout', type: 'number'},
          {name: 'cluster-slave-validity-factor', type: 'nubmer'},
          {name: 'cluster-migration-barrier', type: 'number'},
          {name: 'cluster-require-full-coverage', type: 'boolean'}
        ]
      },
      {
        name: 'Slow Log',
        configs: [
          {name: 'slowlog-log-slower-than', type: 'number'},
          {name: 'slowlog-max-len', type: 'number'}
        ]
      },
      {
        name: 'Latency Monitor',
        configs: [
          {name: 'latency-monitor-threshold', type: 'number'}
        ]
      },
      {
        name: 'Event Notification',
        configs: [
          {name: 'notify-keyspace-events'}
        ]
      },
      {
        name: 'Advanced Config',
        configs: [
          {name: 'hash-max-ziplist-entries', type: 'number'},
          {name: 'hash-max-ziplist-value', type: 'number'},
          {name: 'list-max-ziplist-entries', type: 'number'},
          {name: 'list-max-ziplist-value', type: 'number'},
          {name: 'set-max-intset-entries', type: 'number'},
          {name: 'zset-max-ziplist-entries', type: 'number'},
          {name: 'zset-max-ziplist-value', type: 'number'},
          {name: 'hll-sparse-max-bytes', type: 'number'},
          {name: 'activerehashing', type: 'boolean'},
          {name: 'client-output-buffer-limit'},
          {name: 'hz', type: 'number'},
          {name: 'aof-rewrite-incremental-fsync', type: 'boolean'}
        ]
      }
    ]
    this.state = {
      groups: [],
      unsavedRewrites: {},
      unsavedConfigs: {}
    }
    this.load()
  }

  load() {
    this.props.redis.config('get', '*').then(config => {
      const configs = {}

      for (let i = 0; i < config.length - 1; i += 2) {
        configs[config[i]] = config[i + 1]
      }

      const groups = clone(this.groups, true).map(g => {
        g.configs = g.configs.map(c => {
          if (typeof configs[c.name] !== 'undefined') {
            c.value = configs[c.name]
            delete configs[c.name]
          }
          return c
        }).filter(c => typeof c.value !== 'undefined')
        return g
      }).filter(g => g.configs.length)

      if (Object.keys(configs).length) {
        groups.push({name: 'Other', configs: Object.keys(configs).map(key => {
          return {
            name: key,
            value: configs[key]
          }
        })})
      }

      this.setState({
        groups,
        unsavedConfigs: {},
        unsavedRewrites: {}
      })
    })
  }

  componentWillUnmount() {
    this.props.redis.removeAllListeners('select', this.onSelectBinded)
  }

  renderGroup(group) {
    return (<div
      key={group.name}
      className="config-group"
      >
      <h3>{group.name}</h3>
      { group.configs.map(this.renderConfig, this) }
    </div>)
  }

  change({name, value}) {
    this.state.unsavedConfigs[name] = value
    this.state.unsavedRewrites[name] = value
    this.setState({
      groups: this.state.groups,
      unsavedConfigs: this.state.unsavedConfigs,
      unsavedRewrites: this.state.unsavedRewrites
    })
  }

  renderConfig(config) {
    let input
    const props = {readOnly: this.writeableFields.indexOf(config.name) === -1}
    props.disabled = props.readOnly
    if (config.type === 'boolean' &&
        (config.value === 'yes' || config.value === 'no')) {
      input = (<input
        type="checkbox" checked={config.value === 'yes'} onChange={e => {
          config.value = e.target.checked ? 'yes' : 'no'
          this.change(config)
        }} {...props}
           />)
    } else if (config.type === 'number' && String(parseInt(config.value, 10)) === config.value) {
      input = (<input
        type="number" value={config.value} onChange={e => {
          config.value = e.target.value
          this.change(config)
        }} {...props}
           />)
    } else if (Array.isArray(config.type) && config.type.indexOf(config.value) !== -1) {
      input = (<select
        value={config.value} onChange={e => {
          config.value = e.target.value
          this.change(config)
        }} {...props}
           >
        {config.type.map(option => <option key={option}>{option}</option>)}
      </select>)
    } else {
      input = (<input
        type="text" value={config.value} onChange={e => {
          config.value = e.target.value
          this.change(config)
        }} {...props}
           />)
    }
    return (<div
      className="nt-form-row"
      key={config.name}
      >
      <label htmlFor={config.name}>{config.name}</label>
      { input }
      <div className="description">{config.description}</div>
    </div>)
  }

  isChanged(rewrite) {
    return Object.keys(this.state[rewrite ? 'unsavedRewrites' : 'unsavedConfigs']).length > 0
  }

  handleReload() {
    if (this.isChanged()) {
      showModal({
        title: 'Reload config?',
        content: 'Are you sure you want to reload the config? Your changes will be lost if you reload the config.',
        button: 'Reload'
      }).then(() => {
        this.load()
      })
    } else {
      this.load()
    }
  }

  handleSave() {
    showModal({
      title: 'Save the changes',
      content: 'Are you sure you want to apply the changes and save the changes to the config file?',
      button: 'Save'
    }).then(() => {
      return this.handleApply(true)
    }).then(res => {
      return this.props.redis.config('rewrite')
    }).then(res => {
      this.setState({unsavedRewrites: {}})
    }).catch(err => {
      alert(err.message)
    })
  }

  handleApply(embed) {
    const confirm = embed ? Promise.resolve(1) : showModal({
      title: 'Apply the changes',
      content: 'Are you sure you want to apply the changes? The changes are only valid for the current session and will be lost when Redis restarts.',
      button: 'Apply'
    })
    return confirm.then(() => {
      const pipeline = this.props.redis.pipeline()
      const unsavedConfigs = this.state.unsavedConfigs
      Object.keys(unsavedConfigs).forEach(config => {
        pipeline.config('set', config, unsavedConfigs[config])
      })
      return pipeline.exec()
    }).then(res => {
      this.setState({unsavedConfigs: {}})
    })
  }

  render() {
    return (<div style={this.props.style} className="Config">
      <div className="wrapper">
        <form>
          {
            this.state.groups.map(this.renderGroup, this)
          }
        </form>
        <div className="nt-button-group nt-button-group--pull-right">
          <button
            ref="submit"
            className="nt-button"
            onClick={this.handleReload.bind(this)}
            >Reload</button>
          <button
            ref="submit"
            className="nt-button"
            disabled={!this.isChanged(true)}
            onClick={this.handleSave.bind(this)}
            >Save To Config File</button>
          <button
            ref="cancel"
            className="nt-button nt-button--primary"
            disabled={!this.isChanged()}
            onClick={() => {
              this.handleApply()
            }}
            >Apply</button>
        </div>
      </div>
    </div>)
  }
}

export default Config
