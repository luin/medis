'use strict'

import React, {PureComponent} from 'react'
import {createSelector} from 'reselect'
import {Provider, connect} from 'react-redux'
import InstanceTabs from './InstanceTabs'
import InstanceContent from './InstanceContent'
import DocumentTitle from 'react-document-title'
import {createInstance, selectInstance, delInstance, moveInstance} from 'Redux/actions'
import store from 'Redux/store'

class MainWindow extends PureComponent {
  componentDidMount() {
    $(window).on('keydown.redis', this.onHotKey.bind(this))
  }

  componentWillUnmount() {
    $(window).off('keydown.redis')
  }

  onHotKey(e) {
    const {instances, selectInstance} = this.props
    if (!e.ctrlKey && e.metaKey) {
      const code = e.keyCode
      if (code >= 49 && code <= 57) {
        const number = code - 49
        if (number === 8) {
          const instance = instances.get(instances.count() - 1)
          if (instance) {
            selectInstance(instance.get('key'))
            return false
          }
        } else {
          const instance = instances.get(number)
          if (instance) {
            selectInstance(instance.get('key'))
            return false
          }
        }
      }
    }
    return true
  }

  getTitle() {
    const {activeInstance} = this.props
    if (!activeInstance) {
      return ''
    }
    const version = activeInstance.get('version')
      ? `(Redis ${activeInstance.get('version')}) `
      : ''

    return version + activeInstance.get('title')
  }

  render() {
    const {instances, activeInstance, createInstance,
      selectInstance, delInstance, moveInstance} = this.props

    return (<DocumentTitle title={this.getTitle()}>
      <div className="window">
        <InstanceTabs
          instances={instances}
          onCreateInstance={createInstance}
          onSelectInstance={selectInstance}
          onDelInstance={delInstance}
          onMoveInstance={moveInstance}
          activeInstanceKey={activeInstance.get('key')}
          />
        <InstanceContent
          instances={instances}
          activeInstanceKey={activeInstance.get('key')}
          />
      </div>
    </DocumentTitle>)
  }
}

const selector = createSelector(
  state => state.instances,
  state => state.activeInstanceKey,
  (instances, activeInstanceKey) => {
    return {
      instances,
      activeInstance: instances.find(instance => instance.get('key') === activeInstanceKey)
    }
  }
)

const mapDispatchToProps = {
  createInstance,
  selectInstance,
  delInstance,
  moveInstance
}

const MainWindowContainer = connect(selector, mapDispatchToProps)(MainWindow)

export default <Provider store={store}>
  <MainWindowContainer/>
</Provider>
