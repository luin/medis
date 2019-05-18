'use strict'

import React, {memo} from 'react'
require('./index.scss')

const TABS = ['Content', 'Terminal', 'Config']

function renderTabIcon(tab) {
  switch (tab) {
    case 'Content':
      return <span className="icon icon-book" />
    case 'Terminal':
      return <span className="icon icon-window" />
    case 'Config':
      return <span className="icon icon-cog" />
  }
}

function renderTab(tab, {activeTab, onSelectTab}) {
  return <div
    className={'item' + (tab === activeTab ? ' is-active' : '')}
    key={tab}
    onClick={() => onSelectTab(tab)}
  >
    {renderTabIcon(tab)}
    {tab}
  </div>
}

function Content(props) {
  return <div className="TabBar">{TABS.map(tab => renderTab(tab, props))}</div>
}

export default memo(Content)
