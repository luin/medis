'use strict';

import React from 'react';

class DraggableList extends React.Component {
  constructor() {
    super();
    this.placeholder = document.createElement('div');
    this.placeholder.className = 'placeholder';
    this.placeholder.innerHTML = 'Drag';
  }

  dragStart(e) {
    this.dragged = e.currentTarget;
    this.dragged.style.display = 'none';
    e.dataTransfer.effectAllowed = 'move';
  }

  dragEnd() {
    this.dragged.style.opacity = '1';
    this.dragged.style.display = 'block';
    this.dragged.parentNode.removeChild(this.placeholder);
  }

  dragOver(e) {
    e.preventDefault();
    // if (e.target.getAttribute('draggable') === 'true') {
    if (e.target.className === 'placeholder') {
      return;
    }
    this.over = e.target;
    e.target.parentNode.insertBefore(this.placeholder, e.target);
  }

  render() {
    return <div onDragOver={this.dragOver.bind(this)}>
      {
        this.props.children.map((item, index) => {
          return React.cloneElement(item, {
            onDragStart: this.dragStart.bind(this),
            onDragEnd: this.dragEnd.bind(this),
            draggable: 'true',
            key: index
          });
        })
      }
    </div>;
  }

  componentWillUnmount() {
  }

}

export default DraggableList;
