'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import Editor from './Editor';

class StringContent extends BaseContent {
  init(keyName) {
    super.init(keyName);
    this.props.redis.getBuffer(keyName, (_, buffer) => {
      this.setState({ buffer });
    });
  }

  save(value, callback) {
    if (this.state.keyName) {
      this.props.redis.setKeepTTL(this.state.keyName, value, callback);
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
