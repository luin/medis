'use strict'

import React from 'react'
import BaseContent from '.'
import Editor from './Editor'

class StringContent extends BaseContent {
  init(keyName, keyType) {
    super.init(keyName, keyType)
    this.props.redis.getBuffer(keyName, (_, buffer) => {
      this.setState({buffer: buffer instanceof Buffer ? buffer : Buffer.alloc(0)})
    })
  }

  save(value, callback) {
    if (this.state.keyName) {
      this.props.redis.setKeepTTL(this.state.keyName, value, (err, res) => {
        this.props.onKeyContentChange()
        callback(err, res)
      })
    } else {
      alert('Please wait for data been loaded before saving.')
    }
  }

  create() {
    return this.props.redis.set(this.state.keyName, '')
  }

  render() {
    return (<Editor
      buffer={this.state.buffer}
      onSave={this.save.bind(this)}
      />)
  }
}

export default StringContent
