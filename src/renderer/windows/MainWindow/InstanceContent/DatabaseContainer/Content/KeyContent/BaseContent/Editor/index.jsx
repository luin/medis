'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import Codemirror from 'medis-react-codemirror'
require('codemirror/mode/javascript/javascript')
require('codemirror/addon/lint/json-lint')
require('codemirror/addon/lint/lint')
require('codemirror/addon/selection/active-line')
require('codemirror/addon/edit/closebrackets')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/search/search')
require('codemirror/addon/search/searchcursor')
require('codemirror/addon/search/jump-to-line')
require('codemirror/addon/dialog/dialog')
require('codemirror/addon/dialog/dialog.css')
import jsonlint from 'jsonlint'
window.jsonlint = jsonlint.parser
require('codemirror/lib/codemirror.css')
require('codemirror/addon/lint/lint.css')
const msgpack = require('msgpack5')()

require('./index.scss')

class Editor extends React.PureComponent {
  constructor() {
    super()

    this.resizeObserver = new ResizeObserver(() => {
      this.updateLayout()
    })

    this.state = {
      currentMode: '',
      wrapping: true,
      changed: false,
      modes: {
        raw: false,
        json: false,
        messagepack: false
      }
    }
  }

  updateLayout() {
    const {wrapSelector, codemirror} = this.refs

    const $this = $(ReactDOM.findDOMNode(this))
    if ($this.width() < 372) {
      $(ReactDOM.findDOMNode(wrapSelector)).hide()
    } else {
      $(ReactDOM.findDOMNode(wrapSelector)).show()
    }
    if (codemirror) {
      codemirror.getCodeMirror().refresh()
    }
  }

  componentDidMount() {
    this.init(this.props.buffer)
    this.resizeObserver.observe(ReactDOM.findDOMNode(this))
  }

  componentWillUnmount() {
    this.resizeObserver.disconnect()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.buffer !== this.props.buffer) {
      this.init(nextProps.buffer)
    }
  }

  init(buffer) {
    if (!buffer) {
      this.setState({currentMode: '', changed: false})
      return
    }
    const content = buffer.toString()
    const modes = {}
    modes.raw = content
    modes.json = tryFormatJSON(content, true)
    modes.messagepack = modes.json ? false : tryFormatMessagepack(buffer, true)
    let currentMode = 'raw'
    if (modes.messagepack) {
      currentMode = 'messagepack'
    } else if (modes.json) {
      currentMode = 'json'
    }
    this.setState({modes, currentMode, changed: false}, () => {
      this.updateLayout()
    })
  }

  save() {
    let content = this.state.modes.raw
    if (this.state.currentMode === 'json') {
      content = tryFormatJSON(this.state.modes.json)
      if (!content) {
        alert('The json is invalid. Please check again.')
        return
      }
    } else if (this.state.currentMode === 'messagepack') {
      content = tryFormatMessagepack(this.state.modes.messagepack)
      if (!content) {
        alert('The json is invalid. Please check again.')
        return
      }
      content = msgpack.encode(JSON.parse(content))
    }
    this.props.onSave(content, err => {
      if (err) {
        alert(`Redis save failed: ${err.message}`)
      } else {
        this.init(typeof content === 'string' ? Buffer.from(content) : content)
      }
    })
  }

  updateContent(mode, content) {
    if (this.state.modes[mode] !== content) {
      this.state.modes[mode] = content
      this.setState({modes: this.state.modes, changed: true})
    }
  }

  updateMode(evt) {
    const newMode = evt.target.value
    this.setState({currentMode: newMode})
  }

  focus() {
    const codemirror = this.refs.codemirror
    if (codemirror) {
      const node = ReactDOM.findDOMNode(codemirror)
      if (node) {
        node.focus()
      }
    }
  }

  handleKeyDown(evt) {
    if (!evt.ctrlKey && evt.metaKey && evt.keyCode === 83) {
      this.save()
      evt.preventDefault()
      evt.stopPropagation()
    }
  }

  render() {
    let viewer
    if (this.state.currentMode === 'raw') {
      viewer = (<Codemirror
        ref="codemirror"
        key="raw"
        value={this.state.modes.raw}
        onChange={this.updateContent.bind(this, 'raw')}
        options={{
          mode: 'none',
          styleActiveLine: true,
          lineWrapping: this.state.wrapping,
          gutters: ['CodeMirror-lint-markers'],
          lineNumbers: true
        }}
        />)
    } else if (this.state.currentMode === 'json') {
      viewer = (<Codemirror
        ref="codemirror"
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
          gutters: ['CodeMirror-lint-markers'],
          autoCloseBrackets: true,
          matchTags: true,
          lint: Boolean(this.state.modes.raw)
        }}
        />)
    } else if (this.state.currentMode === 'messagepack') {
      viewer = (<Codemirror
        ref="codemirror"
        key="messagepack"
        value={this.state.modes.messagepack}
        onChange={this.updateContent.bind(this, 'messagepack')}
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
          gutters: ['CodeMirror-lint-markers'],
          autoCloseBrackets: true,
          matchTags: true,
          lint: Boolean(this.state.modes.raw)
        }}
        />)
    } else {
      viewer = <div/>
    }
    return (<div
      style={{flex: 1, display: 'flex', flexDirection: 'column'}}
      className="Editor"
      onKeyDown={this.handleKeyDown.bind(this)}
      >
      { viewer }
      <div
        className="operation-pannel"
        >
        <label className="wrap-selector" ref="wrapSelector">
          <input
            type="checkbox"
            checked={this.state.wrapping}
            onChange={evt => this.setState({wrapping: evt.target.checked})}
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
          <option value="messagepack" disabled={typeof this.state.modes.messagepack !== 'string'}>MessagePack</option>
        </select>
        <button
          className="nt-button"
          disabled={!this.state.changed}
          onClick={this.save.bind(this)}
          >Save Changes</button>
      </div>
    </div>)
  }
}

export default Editor

function tryFormatJSON(jsonString, beautify) {
  try {
    const o = JSON.parse(jsonString)
    if (o && typeof o === 'object' && o !== null) {
      if (beautify) {
        return JSON.stringify(o, null, '\t')
      }
      return JSON.stringify(o)
    }
  } catch (e) { /**/ }

  return false
}

function tryFormatMessagepack(buffer, beautify) {
  try {
    let o
    if (typeof buffer === 'string') {
      o = JSON.parse(buffer)
    } else {
      o = msgpack.decode(buffer)
    }
    if (o && typeof o === 'object' && o !== null) {
      if (beautify) {
        return JSON.stringify(o, null, '\t')
      }
      return JSON.stringify(o)
    }
  } catch (e) { /**/ }

  return false
}
