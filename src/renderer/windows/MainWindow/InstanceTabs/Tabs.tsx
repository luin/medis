import React, {memo} from 'react'
import {SortableContainer} from 'react-sortable-hoc'
import Tab from './Tab'

interface ITabsProps {
  instances: any
  activeInstanceKey: string
  onTabSelect: (key: string) => void
  onTabClose: (key: string) => void

}
function Tabs({instances, activeInstanceKey, onTabSelect, onTabClose}: ITabsProps) {
  return (
    <div style={{display: 'flex', flex: 1}}>
      {instances.map((instance, index) => {
        const key = instance.get('key')
        return <Tab
          key={key}
          instanceKey={key}
          index={index}
          title={instance.get('title')}
          active={activeInstanceKey === key}
          onTabClick={onTabSelect}
          onTabCloseButtonClick={onTabClose}
        />
      })}
    </div>
  )
}

export default memo(SortableContainer(Tabs))
