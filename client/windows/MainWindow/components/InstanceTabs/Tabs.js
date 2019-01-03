'use strict';

import _ from 'lodash';
import React from 'react';
import {SortableContainer} from 'react-sortable-hoc';
import Tab from './Tab'

class Tabs extends React.Component {
  render() {
    const {instances, activeInstanceKey, onTabSelect, onTabClose} = this.props
    return (
      <div style={{display: 'flex', flex: 1}}>
        {instances.map((instance, index) => {
          return <Tab
            key={instance.get('key')}
            instanceKey={instance.get('key')}
            index={index}
            title={instance.get('title')}
            active={activeInstanceKey === instance.get('key')}
            onTabClick={onTabSelect}
            onTabCloseButtonClick={onTabClose}
          />
        })}
      </div>
    )
  }
}

export default SortableContainer(Tabs);
