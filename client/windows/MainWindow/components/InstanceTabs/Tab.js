'use strict';

import React from 'react';
import {SortableElement} from 'react-sortable-hoc';

class Tab extends React.Component {
  render() {
    const {instanceKey, onTabClick, onTabCloseButtonClick, active, title} = this.props
    return <div
      onMouseDown={() => {
        onTabClick(instanceKey)
      }}
      className={active ? 'tab-item active' : 'tab-item'}
      ref={instanceKey}>
      {title || 'Quick Connect'}
      <span
        className="icon icon-cancel icon-close-tab"
        onClick={() => onTabCloseButtonClick(instanceKey)}></span>
    </div>
  }
}

export default SortableElement(Tab);
