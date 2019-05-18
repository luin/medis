import React from 'react'
import {connect} from 'react-redux'
import {createPattern, updatePattern, removePattern} from 'Redux/actions'
import {List} from 'immutable'

require('./app.scss')

const connectionKey = getParameterByName('arg')

class App extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {index: 0}
  }

  handleChange(property, e) {
    this.setState({[property]: e.target.value})
  }

  select(index) {
    this.setState({
      index,
      name: null,
      value: null
    })
  }

  renderPatternForm(activePattern) {
    if (!activePattern) {
      return null
    }
    return <div
    key={this.state.indexKey}
    className="form nt-box"
    style={{display: activePattern ? 'block' : 'none'}}
    >
      <div className="nt-form-row nt-form-row--vertical">
        <label htmlFor="name">Name:</label>
        <input
          type="text" id="name"
          readOnly={!activePattern}
          value={typeof this.state.name === 'string' ? this.state.name : activePattern.get('name')}
          onChange={this.handleChange.bind(this, 'name')}
          />
      </div>
      <div className="nt-form-row nt-form-row--vertical">
        <label htmlFor="value">Pattern:</label>
        <input
          type="text" id="value"
          readOnly={!activePattern}
          value={typeof this.state.value === 'string' ? this.state.value : activePattern.get('value')}
          onChange={this.handleChange.bind(this, 'value')}
          />
      </div>
      <div className="nt-button-group nt-button-group--pull-right" style={{margin: '10px auto 0'}}>
        <button
          disabled={this.state.name === '' || this.state.value === ''}
          className="nt-button nt-button--primary"
          onClick={() => {
            this.props.updatePattern(connectionKey, this.state.index, {
              name: this.state.name || activePattern.get('name'),
              value: this.state.value || activePattern.get('value')
            })
            alert('Save Successfully')
          }}
          >Save</button>
      </div>
    </div>
  }

  render() {
    const {patterns, createPattern, removePattern} = this.props
    const activePattern = patterns.get(this.state.index)
    return (<div className="window">
      <div className="patternList">
        <div>{
          patterns.map((pattern, index) => {
            return (<a
              key={pattern.get('key')}
              className={'nav-group-item' + (index === this.state.index ? ' is-active' : '')}
              onClick={() => this.select(index)}
              >
              <span>{pattern.get('name')}</span>
            </a>)
          })
        }</div>
        <footer>
          <button
            onClick={() => {
              const index = patterns.size
              createPattern(connectionKey)
              this.select(index)
            }}
            >+</button>
          <button
            className={activePattern ? '' : 'is-disabled'}
            onClick={() => {
              if (activePattern) {
                removePattern(connectionKey, this.state.index)
                this.select(this.state.index > 0 ? this.state.index - 1 : 0)
              }
            }}
            >-</button>
        </footer>
      </div>
      {this.renderPatternForm(activePattern)}
    </div>)
  }
}

function mapStateToProps(state) {
  return {
    patterns: state.patterns.get(connectionKey, List())
  }
}

const mapDispatchToProps = {
  updatePattern,
  createPattern,
  removePattern
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
  const results = regex.exec(location.search)
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}
