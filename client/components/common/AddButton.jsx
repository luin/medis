import React from 'react';
import ReactDOM from 'react-dom';

require('./AddButton.scss');

export default class AddButton extends React.Component {
  constructor() {
    super();
  }

  render() {
    return <div className="AddButton">
      {this.props.title}
      {
        this.props.reload && <span className="reload icon icon-cw" onClick={this.props.onReload}></span>
      }
      <span className="plus" onClick={this.props.onClick}>+</span>
    </div>;
  }
}
