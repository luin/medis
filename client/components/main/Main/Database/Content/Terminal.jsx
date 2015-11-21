'use strict';

import React from 'react';
import commands from 'redis-commands';

require('./TabBar.scss');

class Terminal extends React.Component {
  componentDidMount() {
    const redis = this.props.redis;
    $(this.refs.terminal).terminal((command, term) => {
      console.log();
      redis.call.apply(redis, command.split(' ')).then(res => {
        term.echo(res);
      }).catch(err => {
        console.log(err);
      });
    }, {
      greetings: 'Javascript Interpreter',
      exit: false,
      completion: commands.list.concat(commands.list.map(c => c.toUpperCase())),
      name: 'Redis Terminal',
      height: '100%',
      width: '100%',
      prompt: 'redis> '
    });
  }

  render() {
    return <div ref="terminal" style={this.props.style} className="Terminal">
    </div>;
  }
}

export default Terminal;
