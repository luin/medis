'use strict'

import React from 'react'
import commands from 'redis-commands'
import splitargs from 'redis-splitargs'
import 'jquery.terminal'

require('../../../../../../../../node_modules/jquery.terminal/css/jquery.terminal.css')
require('./index.scss')

class Terminal extends React.PureComponent {
  constructor() {
    super()
    this.onSelectBinded = this.onSelect.bind(this)
  }

  componentDidMount() {
    const {redis} = this.props
    redis.on('select', this.onSelectBinded)
    const terminal = this.terminal = $(this.refs.terminal).terminal((command, term) => {
      if (!command) {
        return
      }
      command = splitargs(command)
      const commandName = command[0] && command[0].toUpperCase()
      if (commandName === 'FLUSHALL' || commandName === 'FLUSHDB') {
        term.push(input => {
          if (input.match(/y|yes/i)) {
            this.execute(term, command)
            term.pop()
          } else if (input.match(/n|no/i)) {
            term.pop()
          }
        }, {
          prompt: '[[;#aac6e3;]Are you sure (y/n)? ]'
        })
      } else {
        this.execute(term, command)
      }
    }, {
      greetings: '',
      exit: false,
      completion(command, callback) {
        const commandName = command.split(' ')[0]
        const lower = commandName.toLowerCase()
        const isUppercase = commandName.toUpperCase() === commandName
        callback(
          commands.list
          .filter(item => item.indexOf(lower) === 0)
          .map(item => {
            const last = item.slice(commandName.length)
            return commandName + (isUppercase ? last.toUpperCase() : last)
          })
        )
      },
      name: this.props.connectionKey,
      height: '100%',
      width: '100%',
      outputLimit: 200,
      prompt: `[[;#fff;]redis> ]`,
      keydown(e) {
        if (!terminal.enabled()) {
          return true
        }
        if (e.ctrlKey || e.metaKey) {
          if (e.keyCode >= 48 && e.keyCode <= 57) {
            return true
          }
          if ([84, 87, 78, 82, 81].indexOf(e.keyCode) !== -1) {
            return true
          }
        }
        if (e.ctrlKey) {
          if (e.keyCode === 67) {
            if (terminal.level() > 1) {
              terminal.pop()
              if (terminal.paused()) {
                terminal.resume()
              }
            }
            return false
          }
        }
      }
    })
  }

  onSelect(db) {
    this.props.onDatabaseChange(db)
  }

  execute(term, args) {
    term.pause()
    const redis = this.props.redis
    if (args.length === 1 && args[0].toUpperCase() === 'MONITOR') {
      redis.monitor((_, monitor) => {
        term.echo('[[;#aac6e3;]Enter monitor mode. Press Ctrl+C to exit. ]')
        term.resume()
        term.push(input => {
        }, {
          onExit() {
            monitor.disconnect()
          }
        })
        monitor.on('monitor', (time, args) => {
          if (term.level() > 1) {
            term.echo(formatMonitor(time, args), {raw: true})
          }
        })
      })
    } else if (args.length > 1 && ['SUBSCRIBE', 'PSUBSCRIBE'].indexOf(args[0].toUpperCase()) !== -1) {
      const newRedis = redis.duplicate()
      newRedis.call.apply(newRedis, args).then(res => {
        term.echo('[[;#aac6e3;]Enter subscription mode. Press Ctrl+C to exit. ]')
        term.resume()
        term.push(input => {
        }, {
          prompt: '',
          onExit() {
            newRedis.disconnect()
          }
        })
      })
      newRedis.on('message', (channel, message) => {
        term.echo(formatMessage(channel, message), {raw: true})
      })
      newRedis.on('pmessage', (pattern, channel, message) => {
        term.echo(formatMessage(channel, message), {raw: true})
      })
    } else {
      redis.call.apply(redis, args).then(res => {
        term.echo(getHTML(res), {raw: true})
        term.resume()
      }).catch(err => {
        term.echo(getHTML(err), {raw: true})
        term.resume()
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.style.display === 'none' && nextProps.style.display === 'block') {
      this.terminal.focus()
    }
  }

  componentWillUnmount() {
    this.props.redis.removeAllListeners('select', this.onSelectBinded)
  }

  render() {
    return (<div ref="terminal" style={this.props.style} className="Terminal"/>)
  }
}

export default Terminal

function getHTML(response) {
  if (Array.isArray(response)) {
    return `<ul class="array-resp">
    ${response.map((item, index) => '<li><span>' + index + '</span>' + getHTML(item) + '</li>').join('')}
    </ul>`
  }
  const type = typeof response
  if (type === 'number') {
    return `<div class="number">${response}</div>`
  }
  if (type === 'string') {
    return `<div class="string">${response.replace(/\r?\n/g, '<br>')}</div>`
  }
  if (response === null) {
    return `<div class="null">null</div>`
  }
  if (response instanceof Error) {
    return `<div class="error">${response.message}</div>`
  }
  if (type === 'object') {
    return `<ul class="object-resp">
    ${Object.keys(response).map(item => '<li><span class="key">' + item + '</span>' + getHTML(response[item]) + '</li>').join('')}
    <ul>`
  }

  return `<div class="json">${JSON.stringify(response)}</div>`
}

function formatMonitor(time, args) {
  args = args || []
  const command = args[0] ? args.shift().toUpperCase() : ''
  if (command) {
    commands.getKeyIndexes(command.toLowerCase(), args).forEach(index => {
      args[index] = `<span class="command-key">${args[index]}</span>`
    })
  }
  return `<div class="monitor">
    <span class="time">${time}</span>
    <span class="command">
      <span class="command-name">${command}</span>
      <span class="command args">${args.join(' ')}</span>
    </span>
  </div>`
}

function formatMessage(channel, message) {
  return `<div class="monitor">
    <span class="time">${channel}</span>
    <span class="message">${message}</span>
  </div>`
}
