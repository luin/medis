import React from 'react';
import ReactDOM from 'react-dom';

require('./ContentEditable.scss');

export default class ContentEditable extends React.Component {
  constructor() {
    super();
  }

  render() {
    return <div
      {...this.props}
      onInput={this.handleChange.bind(this)}
      onKeyDown={this.handleKeyDown.bind(this)}
      onBlur={this.handleSubmit.bind(this)}
      contentEditable={this.props.enabled}
      dangerouslySetInnerHTML={{__html: this.props.html}}></div>;
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.html !== ReactDOM.findDOMNode(this).innerHTML ||
      nextProps.enabled !== this.props.enabled;
  }

  componentDidMount(){
    if (this.props.enabled) {
      ReactDOM.findDOMNode(this).focus();
    }
  }

  componentDidUpdate() {
    const node = ReactDOM.findDOMNode(this);
    if (this.props.html !== node.innerHTML) {
      node.innerHTML = this.props.html;
    }
    if (this.props.enabled) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  handleKeyDown(evt) {
    if (evt.keyCode === 13) {
      this.props.onChange(ReactDOM.findDOMNode(this).textContent);
      return false;
    }
    if (evt.keyCode === 27) {
      this.props.onChange(this.props.html);
      return false;
    }
  }

  handleChange(evt) {
    var html = ReactDOM.findDOMNode(this).innerHTML;
    if (html !== this.lastHtml) {
      evt.target = { value: html };
    }
    this.lastHtml = html;
  }

  handleSubmit(evt) {
    this.props.onChange(ReactDOM.findDOMNode(this).textContent);
  }
}
