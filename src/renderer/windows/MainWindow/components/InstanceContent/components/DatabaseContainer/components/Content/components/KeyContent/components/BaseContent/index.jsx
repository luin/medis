'use strict'

import React from 'react'

require('./index.scss')

const getDefaultState = function () {
  return {
    keyName: null,
    content: null,
    desc: false,
    length: 0,
    members: []
  }
}

class BaseContent extends React.Component {
  constructor() {
    super()
    this.state = getDefaultState()
    this.maxRow = 0
    this.cursor = 0
    this.randomClass = 'base-content-' + (Math.random() * 100000 | 0)
  }

  init(keyName, keyType) {
    if (!keyName || !keyType) {
      return
    }
    this.loading = false
    this.setState(getDefaultState())

    const {redis} = this.props

    const method = {
      string: 'strlen',
      list: 'llen',
      set: 'scard',
      zset: 'zcard',
      hash: 'hlen'
    }[keyType]

    redis[method](keyName).then(length => {
      this.setState({keyName, length: length || 0})
    })
  }

  load(index) {
    if (index > this.maxRow) {
      this.maxRow = index
    }
    if (this.loading) {
      return
    }
    this.loading = true
    return true
  }

  rowClassGetter(index) {
    const item = this.state.members[index]
    if (typeof item === 'undefined') {
      return 'type-list is-loading'
    }
    if (index === this.state.selectedIndex) {
      return 'type-list is-selected'
    }
    return 'type-list'
  }

  componentDidMount() {
    this.init(this.props.keyName, this.props.keyType)
  }

  componentDidUpdate() {
    if (typeof this.state.scrollToRow === 'number') {
      this.setState({scrollToRow: null})
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyName !== this.props.keyName ||
        nextProps.keyType !== this.props.keyType) {
      this.init(nextProps.keyName, nextProps.keyType)
    }
  }

  componentWillUnmount() {
    this.setState = function () {}
  }
}

export default BaseContent
