import React from 'react';
import ReactDOM from 'react-dom';
require('json-editor');

require('./Modal.scss');

export default class Modal extends React.Component {
  constructor() {
    super();
    this.state = { active: 0 };
  }

  handleSubmit() {
    this.props.onSubmit(1);
  }

  handleCancel() {
    this.props.onCancel();
  }

  componentDidMount() {
    ReactDOM.findDOMNode(this).focus();
    if (this.props.form) {
      this.editor = new JSONEditor(ReactDOM.findDOMNode(this.refs.form), {
        disable_array_add: true,
        disable_array_delete: true,
        disable_array_reorder: true,
        disable_collapse: true,
        disable_edit_json: true,
        disable_properties: true,
        required_by_default: true,
        schema: this.props.form,
        theme: 'jqueryui'
      });
    }
  }

  handleKeyDown(evt) {
    if (evt.keyCode === 9) {
      this.setState({ active: 1 - this.state.active })
      evt.stopPropagation();
      evt.preventDefault();
      return;
    }
    if (evt.keyCode === 27) {
      this.handleCancel();
      evt.stopPropagation();
      evt.preventDefault();
      return;
    }
    if (evt.keyCode === 13 || evt.keyCode === 32) {
      if (this.state.active === 0) {
        this.handleCancel();
      } else {
        this.handleSubmit();
      }
      evt.stopPropagation();
      evt.preventDefault();
      return;
    }
  }

  render() {
    return <div
      className="Modal"
      tabIndex="0"
      onKeyDown={this.handleKeyDown.bind(this)}
    >
      <div className="Modal__content">
        {
          this.props.title && <div className="Modal__title">
            {this.props.title}
          </div>
        }
        <div className="Modal__body">
          {this.props.content}
          <div className="Modal__form" ref="form" />
        </div>
        <div className="nt-button-group nt-button-group--pull-right">
          <button
            className={'nt-button' + (this.state.active === 0 ? ' nt-button--primary' : '')}
            onClick={this.handleCancel.bind(this)}
          >Cancel</button>
          <button
            className={'nt-button' + (this.state.active === 1 ? ' nt-button--primary' : '')}
            onClick={this.handleSubmit.bind(this)}
            >{this.props.button || 'OK'}</button>
        </div>
      </div>
    </div>;
  }
}
