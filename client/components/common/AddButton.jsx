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
      <span className="plus" onClick={this.props.onClick}>+</span>
    </div>;
  }
}
