'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import Codemirror from 'react-codemirror';
require('react-codemirror/node_modules/codemirror/mode/javascript/javascript');
require('react-codemirror/node_modules/codemirror/addon/lint/json-lint');
require('react-codemirror/node_modules/codemirror/addon/lint/lint');
import jsonlint from 'jsonlint';
window.jsonlint = jsonlint.parser;
require('react-codemirror/node_modules/codemirror/lib/codemirror.css');
require('react-codemirror/node_modules/codemirror/addon/lint/lint.css');

require('./StringContent.scss');

class StringContent extends BaseContent {
  constructor() {
    super();
    this.state.content = '';
  }

  init(keyName) {
    this.setState({ content: '' });
    this.props.redis.get(keyName, (err, content) => {
      content = JSON.stringify(JSON.parse(content), null, 2);
      this.setState({ content });
    });
  }

  updateContent(content) {
    this.setState({ content });
  }

  render() {
    return <div style={{ height: this.props.height }} className="StringContent">
      <Codemirror
        value={this.state.content}
        onChange={this.updateContent.bind(this)}
        options={{
          mode: {
            name: 'javascript',
            json: true
          },
          lineNumbers: true,
          gutters: ["CodeMirror-lint-markers"],
          lint: content
        }}
      />
    </div>;
  }
}

export default StringContent;
