'use strict'

import React from 'react'
import StringContent from './components/StringContent'
import ListContent from './components/ListContent'
import SetContent from './components/SetContent'
import HashContent from './components/HashContent'
import ZSetContent from './components/ZSetContent'

require('./index.scss')

class KeyContent extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    const props = {key: this.props.keyName, ...this.props}
    let view
    switch (this.props.keyType) {
    case 'string': view = <StringContent {...props}/>; break
    case 'list': view = <ListContent {...props}/>; break
    case 'set': view = <SetContent {...props}/>; break
    case 'hash': view = <HashContent {...props}/>; break
    case 'zset': view = <ZSetContent {...props}/>; break
    case 'none':
      view = (<div className="notfound">
        <span className="icon icon-trash"/>
        <p>The key has been deleted</p>
      </div>)
      break
    }
    return <div style={this.props.style} className="BaseContent">{ view }</div>
  }
}

export default KeyContent
