'use strict';

import React from 'react';

class DraggableList extends React.Component {
  dragStart(e) {
    this.dragged = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
  }

  dragEnd() {
    this.dragged.style.opacity = '1';
  }

  dragOver(e) {
    const ele = e.target;
    console.log(ele);
    this.dragged.style.opacity = '0.5';
    this.over = ele;
    ele.parentNode.insertBefore(this.dragged, ele);
    // e.preventDefault();
  }

  render() {
    return <div onDragOver={this.dragOver.bind(this)}>
      {
        this.props.children.map((item, index) => {
          return <div
            onDragStart={this.dragStart.bind(this)}
            onDragEnd={this.dragEnd.bind(this)}
            onDragOver={this.dragOver.bind(this)}
            draggable="true"
            key={index}
          >
            {item}
          </div>;
        })
      }
    </div>;
  }

  componentWillUnmount() {
  }

}

export default DraggableList;
