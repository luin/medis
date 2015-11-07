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

require('./Editor.scss');

class Editor extends React.Component {
  constructor() {
    super();
    this.state = {
      currentMode: null,
      wrapping: true,
      modes: {
        raw: false,
        json: false,
        messagepack: false
      }
    };
  }

  componentDidMount() {
    this.init(this.props.content);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.content !== this.props.content) {
      this.init(nextProps.content);
    }
  }

  init(content) {
    this.state.modes.raw = content;
    this.state.modes.json = tryFormatJSON(content);
    const currentMode = typeof this.state.modes.json === 'string' ? 'json' : 'raw';
    this.setState({ currentMode });
  }

  updateContent(mode, content) {
    let json, raw;
    if (mode === 'raw') {
      raw = content;
      json = tryFormatJSON(content);
    } else if (mode === 'json') {
      json = content;
      try {
        raw = JSON.stringify(JSON.parse(json));
      } catch (e) {
        raw = this.state.modes.raw;
      }
    }
    this.setState({ modes: { json, raw } });
  }

  updateMode(evt) {
    const newMode = evt.target.value;
    this.setState({ currentMode: newMode });
  }

  render() {
    let viewer;
    if (this.state.currentMode === 'raw') {
      viewer = <Codemirror
        key="raw"
        value={this.state.modes.raw}
        onChange={this.updateContent.bind(this, 'raw')}
        options={{
          mode: 'none',
          styleActiveLine: true,
          lineWrapping: this.state.wrapping,
          lineNumbers: true
        }}
      />;
    } else if (this.state.currentMode === 'json') {
      viewer = <Codemirror
        key="json"
        value={this.state.modes.json}
        onChange={this.updateContent.bind(this, 'json')}
        options={{
          mode: {
            name: 'javascript',
            json: true
          },
          tabSize: 2,
          indentWithTabs: true,
          styleActiveLine: true,
          lineNumbers: true,
          lineWrapping: this.state.wrapping,
          gutters: ["CodeMirror-lint-markers"],
          autoCloseBrackets: true,
          matchTags: true,
          lint: !!this.state.modes.raw
        }}
      />
    } else {
      viewer = <div></div>;
    }
    return <div style={{ height: this.props.height }} className="Editor">
      <label className="wrap-selector">
        <input
          type="checkbox"
          checked={this.state.wrapping}
          onChange={evt => this.setState({ wrapping: evt.target.checked })}
        />
        <span>Wrapping</span>
      </label>
      <select
        className="mode-selector"
        value={this.state.currentMode}
        onChange={this.updateMode.bind(this)}
      >
        <option value="raw" disabled={typeof this.state.modes.raw !== 'string'}>Raw</option>
        <option value="json" disabled={typeof this.state.modes.json !== 'string'}>JSON</option>
        <option disabled>MessagePack</option>
      </select>
      <button className="nt-button">Save Changes</button>
      { viewer }
    </div>;
  }
}

export default Editor;

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
