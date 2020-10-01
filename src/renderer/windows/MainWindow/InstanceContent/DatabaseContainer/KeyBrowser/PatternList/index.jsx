'use strict'

import React from 'react'
import {ipcRenderer} from 'electron'

require('./index.scss')

class PatternList extends React.Component {
  constructor(props) {
    super()
    this.state = {
      patternDropdown: false,
      pattern: props.pattern,
      patternHistory: []
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

  updatePatternHistory(value) {
    const i = this.state.patternHistory.indexOf(value)
    if(i != -1)  this.state.patternHistory.splice(index, 1)
    this.state.patternHistory.unshift(value)
    this.setState({
      patternHistory: this.state.patternHistory.slice(0,5)
    })
  }

  handleKeyDown(evt) {
    if (evt.key === 'Enter') {
      this.updatePatternHistory(evt.target.value)
    }
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
        onKeyDown={evt => this.handleKeyDown(evt)}
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
            this.state.patternHistory.map(pattern => {
              return (<li
                  key={pattern}
                  onClick={() => {
                    const value = pattern
                    this.props.onChange(value)
                    this.setState({patternDropdown: false, pattern: value})
                    this.updatePatternHistory(value)
                  }}
                >{pattern}</li>)
            })
          }
        </ul>
        { this.props.pattern.length && this.state.patternHistory.length
            && <div className='list-divider'/>
            || null
        }
        <ul>
          {
            this.props.patterns.map(pattern => {
              return (<li
                  key={pattern.get('key')}
                  onClick={() => {
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
