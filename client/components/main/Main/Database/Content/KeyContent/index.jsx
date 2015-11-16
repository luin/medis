'use strict';

import React from 'react';
import StringContent from './StringContent';
import ListContent from './ListContent';

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
        key={this.props.keyName}
        redis={this.props.redis}
        keyName={this.props.keyName}
      />;
      break;
    case 'list':
      view = <ListContent
        key={this.props.keyName}
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
