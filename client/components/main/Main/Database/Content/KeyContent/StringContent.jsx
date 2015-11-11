'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import Codemirror from 'react-codemirror';
require('react-codemirror/node_modules/codemirror/mode/javascript/javascript');
require('react-codemirror/node_modules/codemirror/addon/lint/json-lint');
require('react-codemirror/node_modules/codemirror/addon/lint/lint');
require('react-codemirror/node_modules/codemirror/addon/selection/active-line');
require('react-codemirror/node_modules/codemirror/addon/edit/closebrackets');
require('react-codemirror/node_modules/codemirror/addon/edit/matchbrackets');
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
      content = JSON.stringify(JSON.parse(content), null, '\t');
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
          tabSize: 2,
          indentWithTabs: true,
          styleActiveLine: true,
          lineNumbers: true,
          gutters: ["CodeMirror-lint-markers"],
          autoCloseBrackets: true,
          matchTags: true,
          lint: !!this.state.content
        }}
      />
    </div>;
  }
}

export default StringContent;
