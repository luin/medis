'use strict';

import ipc from 'ipc';
import React from 'react';
require('./PatternList.scss');

class PatternList extends React.Component {
  constructor() {
    super();
    this.state = {
      patternDropdown: false,
      pattern: ''
    };
  }

  render() {
    return <div className="pattern-input">
      <span className="icon icon-search"></span>
      <input
        type="search"
        className="form-control"
        placeholder="Key name or patterns (e.g. user:*)"
        value={this.state.pattern}
        onChange={evt => {
          const value = evt.target.value;
          this.setState({ pattern: value });
          this.props.onChange(value);
        }}
      />
      <span
        className={'js-pattern-dropdown icon icon-down-open' + (this.state.patternDropdown ? ' is-active' : '')}
        onClick={() => {
          this.setState({ patternDropdown: !this.state.patternDropdown });
        }}
      ></span>
      <div
        className={'js-pattern-dropdown pattern-dropdown' + (this.state.patternDropdown ? ' is-active' : '')}
        style={{ height: this.props.height }}
      >
        <ul>
          {
            this.props.patterns.map(pattern => {
              return <li key={pattern.get('key')} onClick={() => {
                const value = pattern.get('value');
                this.props.onChange(value);
                this.setState({ patternDropdown: false, pattern: value });
              }}>{pattern.get('name')}</li>;
            })
          }
          <li
            className="manage-pattern-button"
            onClick={() => {
              ipc.send('create pattern-manager', this.props.connectionKey);
            }}
            >
            <span className="icon icon-cog"></span>
            Manage Patterns...
          </li>
        </ul>
      </div>
    </div>;
  }
}

export default PatternList ;
