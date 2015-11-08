'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import Editor from './Editor';

class StringContent extends BaseContent {
  constructor() {
    super();
    this.state = { keyName: null, content: null };
  }

  init(keyName) {
    this.setState({ keyName: null, content: null });
    this.props.redis.get(keyName, (err, content) => {
      this.setState({ keyName, content });
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
      content={this.state.content}
      onSave={this.save.bind(this)}
    />
  }
}

export default StringContent;

function tryFormatJSON(jsonString) {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === "object" && o !== null) {
      return JSON.stringify(o, null, '\t');
    }
  }
  catch (e) { }

  return false;
}
