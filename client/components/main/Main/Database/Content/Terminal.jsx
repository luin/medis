'use strict';

import React from 'react';
import commands from 'redis-commands';

require('./Terminal.scss');

class Terminal extends React.Component {
  constructor() {
    super();
    this.onSelectBinded = this.onSelect.bind(this);
  }

  componentDidMount() {
    const redis = this.props.redis;
    redis.on('select', this.onSelectBinded);
    $(this.refs.terminal).terminal((command, term) => {
      command = command.trim().replace(/\s+/g, ' ');
      redis.call.apply(redis, command.split(' ')).then(res => {
        term.echo(getHTML(res), { raw: true });
      }).catch(err => {
        term.echo(getHTML(err), { raw: true });
      });
    }, {
      greetings: '',
      exit: false,
      completion: commands.list.concat(commands.list.map(c => c.toUpperCase())),
      name: 'Redis Terminal',
      height: '100%',
      width: '100%',
      prompt: `[[;#fff;]redis> ]`
    });
  }

  onSelect(db) {
    this.props.onDatabaseChange(db);
  }

  componentWillUnmount() {
    this.props.redis.removeAllListeners('select', this.onSelectBinded);
  }

  render() {
    return <div ref="terminal" style={this.props.style} className="Terminal">
    </div>;
  }
}

export default Terminal;

function getHTML(response) {
  if (Array.isArray(response)) {
    return `<ul start="0" class="array-resp">
      ${response.map((item, index) => '<li><span>' + index + '</span>' + getHTML(item) + '</li>').join('')}
    </ul>`;
  }
  const type = typeof response;
  if (type === 'number') {
    return `<div class="number">${response}</div>`;
  }
  if (type === 'string') {
    return `<div class="string">${response.replace(/\r?\n/g, '<br>')}</div>`;
  }
  if (response === null) {
    return `<div class="null">null</div>`;
  }
  if (response instanceof Error) {
    return `<div class="error">${response.message}</div>`;
  }

  return `<div class="json">${JSON.stringify(response)}</div>`;
}
