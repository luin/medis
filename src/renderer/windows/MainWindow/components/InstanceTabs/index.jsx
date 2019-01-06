'use strict'

import React, {memo} from 'react'
import Tabs from './Tabs'

require('./main.scss')

function isModalShown() {
  return $('.Modal').length > 0
}

let display = 'flex'

function InstanceTabs({onCreateInstance, onSelectInstance, onDelInstance, instances, activeInstanceKey, onMoveInstance}) {
  const handleAddButtonClick = () => {
    if (!isModalShown()) {
      onCreateInstance()
    }
  }

  const handleTabSelect = (key) => {
    if (!isModalShown()) {
      onSelectInstance(key)
    }
  }

  const handleTabClose = (key) => {
    if (!isModalShown()) {
      onDelInstance(key)
    }
  }

  const currentDisplay = instances.count() === 1 ? 'none' : 'flex'
  if (display !== currentDisplay) {
    display = currentDisplay
    // setTimeout(() => $(window).trigger('resize'), 0)
  }

  return <div id="tabGroupWrapper">
    <div className="tab-group" style={{display: display, flex: 1}}>
      <Tabs
        instances={instances}
        activeInstanceKey={activeInstanceKey}
        axis={'x'}
        lockAxis={'x'}
        helperClass={"active"}
        lockToContainerEdges={true}
        lockOffset={[0, 0]}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        onSortEnd={({oldIndex, newIndex}) => {
          if (oldIndex !== newIndex) {
            onMoveInstance(instances.getIn([oldIndex, 'key']), instances.getIn([newIndex, 'key']))
          }
        }}
        shouldCancelStart={(e) => e.target.nodeName.toUpperCase() === 'SPAN'}
      />
      <div className='tab-item tab-item-btn' onClick={handleAddButtonClick}>
        <span>{'+'}</span>
      </div>
    </div>
  </div>
}

export default memo(InstanceTabs)
