'use strict'

import React from 'react'
import {Tab, Tabs} from './components/draggable-tab'

class InstanceTabs extends React.Component {
  constructor() {
    super()
    this.style = 'block'
  }

  render() {
    const style = this.props.instances.count() === 1 ? 'none' : 'block'
    if (this.style !== style) {
      this.style = style
      setTimeout(() => {
        $(window).trigger('resize')
      }, 0)
    }

    const {activeInstanceKey, onCreateInstance, onSelectInstance,
      onDelInstance, onMoveInstance} = this.props
    return (<div style={{display: this.style, zIndex: '1000'}}>
      <Tabs
        onTabAddButtonClick={() => {
          if (!$('.Modal').length) {
            onCreateInstance()
          }
        }}
        onTabSelect={key => {
          if (!$('.Modal').length) {
            onSelectInstance(key)
          }
        }}
        onTabClose={key => {
          if (!$('.Modal').length) {
            onDelInstance(key)
          }
        }}
        onTabPositionChange={onMoveInstance}
        selectedTab={activeInstanceKey}
        tabs={
          this.props.instances.map(instance => {
            return (<Tab key={instance.get('key')} title={instance.get('title')}/>)
          }).toJS()
        }
        />
    </div>)
  }
}

export default InstanceTabs
