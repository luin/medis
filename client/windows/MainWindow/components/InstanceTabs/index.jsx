'use strict'

import React from 'react'
import Tabs from './Tabs'

require('./main.scss')

class InstanceTabs extends React.Component {
  constructor () {
    super()
    this.style = 'block'
  }

  handleAddButtonClick = () => {
    if (!$('.Modal').length) {
      this.props.onCreateInstance()
    }
  }

  handleTabSelect = (key) => {
    if (!$('.Modal').length) {
      this.props.onSelectInstance(key)
    }
  }

  handleTabClose = (key) => {
    if (!$('.Modal').length) {
      this.props.onDelInstance(key)
    }
  }

  render() {
    const {instances, activeInstanceKey, onMoveInstance} = this.props

    const style = instances.count() === 1 ? 'none' : 'block'
    if (this.style !== style) {
      this.style = style
      setTimeout(() => $(window).trigger('resize'), 0)
    }


    return <div className="tab-group">
      <Tabs
        instances={instances}
        activeInstanceKey={activeInstanceKey}
        axis={'x'}
        lockAxis={'x'}
        helperClass={"active"}
        lockToContainerEdges={true}
        lockOffset={[0, 0]}
        onTabSelect={this.handleTabSelect}
        onTabClose={this.handleTabClose}
        onSortEnd={({oldIndex, newIndex}) => {
          if (oldIndex !== newIndex) {
            onMoveInstance(instances.getIn([oldIndex, 'key']), instances.getIn([newIndex, 'key']))
          }
        }}
        shouldCancelStart={(e) => {
          return e.target.nodeName.toUpperCase() === 'SPAN'
        }}
      />
      <div className='tab-item tab-item-btn' onClick={this.handleAddButtonClick}>
        <span>{'+'}</span>
      </div>
    </div>
  }
}

export default InstanceTabs
