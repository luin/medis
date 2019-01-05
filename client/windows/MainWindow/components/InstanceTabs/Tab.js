'use strict';

import React, {memo} from 'react';
import {SortableElement} from 'react-sortable-hoc';

function Tab({instanceKey, onTabClick, onTabCloseButtonClick, active, title = 'Quick Connect'}) {
  return <div
    onMouseDown={() => {
      onTabClick(instanceKey)
    }}
    className={active ? 'tab-item active' : 'tab-item'}
  >
    {title}
    <span
      className="icon icon-cancel icon-close-tab"
      onClick={() => onTabCloseButtonClick(instanceKey)}></span>
  </div>
}

export default memo(SortableElement(Tab));
