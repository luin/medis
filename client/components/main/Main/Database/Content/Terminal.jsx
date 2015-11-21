'use strict';

import React from 'react';
import commands from 'redis-commands';

require('./Terminal.scss');

class Terminal extends React.Component {
  componentDidMount() {
    const redis = this.props.redis;
    $(this.refs.terminal).terminal((command, term) => {
      command = command.trim().replace(/\s+/g, ' ');
      redis.call.apply(redis, command.split(' ')).then(res => {
        if (typeof res === 'number') {
          term.echo(`<div class="number">${res}</div>`, { raw: true });
        } else if (Array.isArray(res)) {
          console.log(res);
          const html = res.map((item, index) => `<div><span>${index}</span>${item}</div>`).join('');
          term.echo(`<div class="list">${html}</div>`, { raw: true });
        }
      }).catch(err => {
        term.error(err.message);
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

  render() {
    return <div ref="terminal" style={this.props.style} className="Terminal">
    </div>;
  }
}

export default Terminal;
