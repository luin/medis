'use strict'

import React from 'react'
import TabBar from './TabBar'
import KeyContent from './KeyContent'
import Terminal from './Terminal'
import Config from './Config'
import Footer from './Footer'

class Content extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      pattern: '',
      db: 0,
      version: 0,
      tab: 'Content'
    }
  }

  init(keyName) {
    this.setState({keyType: null})
    if (keyName !== null) {
      this.setState({keyType: null})
      this.props.redis.type(keyName).then(keyType => {
        if (keyName === this.props.keyName) {
          this.setState({keyType})
        }
      })
    }
  }

  componentDidMount() {
    this.init(this.props.keyName)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyName !== this.props.keyName || nextProps.version !== this.props.version) {
      this.init(nextProps.keyName)
    }
    if (nextProps.metaVersion !== this.props.metaVersion) {
      this.setState({version: this.state.version + 1})
    }
  }

  handleTabChange(tab) {
    this.setState({tab})
  }

  render() {
    return (<div className="pane sidebar" style={{height: '100%'}}>
      <TabBar
        activeTab={this.state.tab}
        onSelectTab={this.handleTabChange.bind(this)}
        />
      <KeyContent
        style={{display: this.state.tab === 'Content' ? 'flex' : 'none'}}
        keyName={this.props.keyName}
        keyType={this.state.keyType}
        height={this.props.height - 66}
        redis={this.props.redis}
        onKeyContentChange={() => {
          this.setState({version: this.state.version + 1})
        }}
        />
      <Terminal
        style={{display: this.state.tab === 'Terminal' ? 'block' : 'none'}}
        height={this.props.height - 67}
        redis={this.props.redis}
        connectionKey={this.props.connectionKey}
        onDatabaseChange={this.props.onDatabaseChange}
        />
      <Config
        style={{display: this.state.tab === 'Config' ? 'block' : 'none'}}
        height={this.props.height - 67}
        redis={this.props.redis}
        connectionKey={this.props.connectionKey}
        />
      <Footer
        keyName={this.props.keyName}
        keyType={this.state.keyType}
        version={this.state.version}
        redis={this.props.redis}
        />
    </div>)
  }
}

export default Content
