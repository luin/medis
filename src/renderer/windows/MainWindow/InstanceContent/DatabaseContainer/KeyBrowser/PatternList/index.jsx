'use strict'

import React from 'react'
import {ipcRenderer} from 'electron'

require('./index.scss')

class PatternList extends React.Component {
  constructor(props) {
    super()
    this.state = {
      patternDropdown: false,
      pattern: props.pattern
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.db !== this.props.db) {
      this.updatePattern('')
    }
    if (nextProps.pattern !== this.props.pattern) {
      this.setState({pattern: nextProps.pattern})
    }
  }

  updatePattern(value) {
    this.setState({pattern: value})
    this.props.onChange(value)
  }

  render() {
    return (<div className="pattern-input">
      <span className="icon icon-search"/>
      <input
        type="search"
        className="form-control"
        placeholder="Key name or patterns (e.g. user:*)"
        value={this.state.pattern}
        onChange={evt => {
          this.updatePattern(evt.target.value)
        }}
        />
      <span
        className={'js-pattern-dropdown icon icon-down-open' + (this.state.patternDropdown ? ' is-active' : '')}
        onClick={() => {
          this.setState({patternDropdown: !this.state.patternDropdown})
        }}
        />
      <div
        className={'js-pattern-dropdown pattern-dropdown' + (this.state.patternDropdown ? ' is-active' : '')}
        style={{maxHeight: this.props.height}}
        >
        <ul>
          {
            this.props.patterns.map(pattern => {
              return (<li
                key={pattern.get('key')} onClick={() => {
                  const value = pattern.get('value')
                  this.props.onChange(value)
                  this.setState({patternDropdown: false, pattern: value})
                }}
                                         >{pattern.get('name')}</li>)
            })
          }
          <li
            className="manage-pattern-button"
            onClick={() => {
              ipcRenderer.send('create patternManager', `${this.props.connectionKey}|${this.props.db}`)
            }}
            >
            <span className="icon icon-cog"/>
            Manage Patterns...
          </li>
        </ul>
      </div>
    </div>)
  }
}

export default PatternList
