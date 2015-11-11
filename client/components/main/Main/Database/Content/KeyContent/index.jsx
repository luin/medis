'use strict';

import React from 'react';
import StringContent from './StringContent';

class KeyContent extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    let view;
    switch (this.props.keyType) {
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
