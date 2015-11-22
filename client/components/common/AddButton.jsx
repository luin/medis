import React from 'react';
import ReactDOM from 'react-dom';

require('./AddButton.scss');

export default class AddButton extends React.Component {
  constructor() {
    super();
  }

  render() {
    return <div
      className="AddButton"
      onKeyDown={this.handleKeyDown.bind(this)}
    >
      <div className="AddButton__content">
        <div className="AddButton__title">
          {this.props.title}
        </div>
        <div className="AddButton__body">
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
