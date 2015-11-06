'use strict';

import React from 'react';
import StringContent from './StringContent';

class KeyContent extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  init(keyName) {
    this.props.redis.type(keyName, (err, type) => {
      console.log(type);
      this.setState({ type });
    });
  }

  componentDidMount() {
    this.init(this.props.keyName);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyName !== this.props.keyName) {
      this.init(nextProps.keyName);
    }
  }

  render() {
    let view;
    switch (this.state.type) {
    case 'string':
      view = <StringContent
        height={this.props.height}
        redis={this.props.redis}
        keyName={this.props.keyName}
      />;
      break;
    default:
      view = <div></div>;
    }
    return view;
  }
}

export default KeyContent;
