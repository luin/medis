'use strict';

import React from 'react';
import StringContent from './StringContent';
import ListContent from './ListContent';
import SetContent from './SetContent';
import HashContent from './HashContent';
import ZSetContent from './ZSetContent';

class KeyContent extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    const props = { key: this.props.keyName, ...this.props };
    switch (this.props.keyType) {
    case 'string': return <StringContent {...props} />;
    case 'list': return <ListContent {...props} />;
    case 'set': return <SetContent {...props} />;
    case 'hash': return <HashContent {...props} />;
    case 'zset': return <ZSetContent {...props} />;
    }
    return <div />;
  }
}

export default KeyContent;
