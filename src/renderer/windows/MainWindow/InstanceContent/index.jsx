'use strict'

import React, {PureComponent} from 'react'
import ConnectionSelectorContainer from './ConnectionSelectorContainer'
import DatabaseContainer from './DatabaseContainer'
import Modal from './Modal'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

class InstanceContent extends PureComponent {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    window.showModal = modal => {
      this.activeElement = document.activeElement
      this.setState({modal})

      return new Promise((resolve, reject) => {
        this.promise = {resolve, reject}
      })
    }
  }

  modalSubmit(result) {
    this.promise.resolve(result)
    this.setState({modal: null})
    if (this.activeElement) {
      this.activeElement.focus()
    }
  }

  modalCancel() {
    this.promise.reject()
    this.setState({modal: null})
    if (this.activeElement) {
      this.activeElement.focus()
    }
  }

  componentWillUnmount() {
    delete window.showModal
  }

  render() {
    const {instances, activeInstanceKey} = this.props
    const contents = instances.map(instance => (
      <div
        key={instance.get('key')}
        style={{display: instance.get('key') === activeInstanceKey ? 'block' : 'none'}}
        >
        {
        instance.get('redis')
          ? <DatabaseContainer instance={instance}/>
          : <ConnectionSelectorContainer instance={instance}/>
      }
      </div>
    ))

    return (
      <div className="main">
        <ReactCSSTransitionGroup
          transitionName="modal"
          transitionEnterTimeout={150}
          transitionLeaveTimeout={150}
          >
          {
          this.state.modal &&
          <Modal
            key="modal"
            {...this.state.modal}
            onSubmit={this.modalSubmit.bind(this)}
            onCancel={this.modalCancel.bind(this)}
            />
        }
        </ReactCSSTransitionGroup>
        {contents}
      </div>
    )
  }
}

export default InstanceContent
