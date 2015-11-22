import React from 'react';
import ReactDOM from 'react-dom';

require('./AddButton.scss');

export default class AddButton extends React.Component {
  constructor() {
    super();
  }

  handleClick() {
    this.props.onClick();
  }

  render() {
    return <div
      className="AddButton"
      onClick={this.handleClick.bind(this)}
    >{this.props.title}<span className="plus">+</span></div>;
  }
}
