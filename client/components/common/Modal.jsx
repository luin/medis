import React from 'react';
import ReactDOM from 'react-dom';

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
        <div className="Modal__title">
          {this.props.title}
        </div>
        <div className="Modal__body">
          {this.props.content}
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
