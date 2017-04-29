'use strict'

import React from 'react'

require('./index.scss')

class Content extends React.Component {
  constructor() {
    super()

    this.tabs = [
      'Content',
      'Terminal',
      'Config'
    ]

    this.state = {activeTab: 'Content'}
  }

  render() {
    return <div className="TabBar">
      {
        this.tabs.map(tab => {
          return <div
            className={ 'item' + (tab === this.state.activeTab ? ' is-active' : '') }
            key={tab}
            onClick={ () => {
              this.setState({activeTab: tab})
              this.props.onSelectTab(tab)
            } }
          >
            {
              (() => {
                if (tab === 'Content') {
                  return <span className="icon icon-book" />
                } else if (tab === 'Terminal') {
                  return <span className="icon icon-window" />
                } else if (tab === 'Config') {
                  return <span className="icon icon-cog" />
                }
              })()
            }
            {tab}
          </div>
        })
      }
    </div>
  }
}

export default Content
