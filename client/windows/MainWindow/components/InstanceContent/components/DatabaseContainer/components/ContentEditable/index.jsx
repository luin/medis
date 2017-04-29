import React from 'react'
import ReactDOM from 'react-dom'

require('./index.scss')

export default class ContentEditable extends React.Component {
  constructor() {
    super()
  }

  render() {
    return (<div
      {...this.props}
      >
      <span
        onInput={this.handleChange.bind(this)}
        onKeyDown={this.handleKeyDown.bind(this)}
        onBlur={this.handleSubmit.bind(this)}
        contentEditable={this.props.enabled}
        ref="text"
        dangerouslySetInnerHTML={{__html: this.props.html}}
        />
    </div>)
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.html !== this.props.html || // ReactDOM.findDOMNode(this.refs.text).innerHTML ||
      nextProps.enabled !== this.props.enabled
  }

  componentDidMount() {
    if (this.props.enabled) {
      ReactDOM.findDOMNode(this.refs.text).focus()
    }
  }

  componentDidUpdate() {
    const node = ReactDOM.findDOMNode(this.refs.text)
    if (this.props.html !== node.innerHTML) {
      node.innerHTML = this.props.html
    }
    if (this.props.enabled) {
      const range = document.createRange()
      range.selectNodeContents(node)
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }

  handleKeyDown(evt) {
    if (evt.keyCode === 13) {
      ReactDOM.findDOMNode(this.refs.text).blur()
      evt.preventDefault()
      evt.stopPropagation()
      return
    }
    if (evt.keyCode === 27) {
      this.props.onChange(this.props.html)
      evt.preventDefault()
      evt.stopPropagation()
    }
  }

  handleChange(evt) {
    const html = ReactDOM.findDOMNode(this.refs.text).innerHTML
    if (html !== this.lastHtml) {
      evt.target = {value: html}
    }
    this.lastHtml = html
  }

  handleSubmit() {
    this.props.onChange(ReactDOM.findDOMNode(this.refs.text).textContent)
  }
}
