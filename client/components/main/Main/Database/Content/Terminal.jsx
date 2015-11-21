'use strict';

import React from 'react';

require('./TabBar.scss');

class Terminal extends React.Component {
  componentDidMount() {
    $(this.refs.terminal).terminal((command, term) => {
      console.log(command, term);
    }, {
      greetings: 'Javascript Interpreter',
      exit: false,
      completion: ['CLUSTER', 'SADD'],
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
