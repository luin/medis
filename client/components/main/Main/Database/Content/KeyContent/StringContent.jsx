'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import Editor from './Editor';

class StringContent extends BaseContent {
  constructor() {
    super();
    this.state = { keyName: null, buffer: null };
  }

  init(keyName) {
    this.setState({ keyName: null, content: null });
    this.props.redis.getBuffer(keyName, (_, buffer) => {
      this.setState({ keyName, buffer });
    });
  }

  save(value, callback) {
    if (this.state.keyName) {
      this.props.redis.set(this.state.keyName, value, callback);
    } else {
      alert('Please wait for data been loaded before saving.');
    }
  }

  render() {
    return <Editor style={{ height: this.props.height }}
      buffer={this.state.buffer}
      onSave={this.save.bind(this)}
    />;
  }
}

export default StringContent;
