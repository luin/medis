'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import Editor from './Editor';

class StringContent extends BaseContent {
  constructor() {
    super();
    this.state = { content: null };
  }

  init(keyName) {
    this.setState({ content: '' });
    this.props.redis.get(keyName, (err, content) => {
      this.setState({ content });
    });
  }

  render() {
    return <Editor style={{ height: this.props.height }}
      content={this.state.content}
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
