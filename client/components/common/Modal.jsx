import React from 'react';
import ReactDOM from 'react-dom';

require('./Modal.scss');

export default class Modal extends React.Component {
  render() {
    return <div
      className="Modal"
    >
      <div className="Modal__content">
        Are you sure you want to delete the selected row from this table? This action cannot be undone.
      </div>
      <div className="Modal__button-group">
        <button className="Modal__button">Cancel</button>
        <button className="Modal__button">Delete</button>
      </div>
    </div>;
  }
}
