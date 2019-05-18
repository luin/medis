'use strict'

import React, {memo} from 'react'
import {List} from 'immutable'
import PatternList from './PatternList'
import KeyList from './KeyList'
import Footer from './Footer'

const FOOTER_HEIGHT = 66

function KeyBrowser({
  pattern, patterns, connectionKey, db, height, width, redis,
  onPatternChange, onCreateKey, onKeyMetaChange, onSelectKey, onDatabaseChange
}) {
  const clientHeight = height - FOOTER_HEIGHT
  return (<div className="pane sidebar">
    <PatternList
      patterns={patterns.get(`${connectionKey}|${db}`, List())}
      height={clientHeight}
      connectionKey={connectionKey}
      db={db}
      pattern={pattern}
      onChange={onPatternChange}
    />
    <KeyList
      height={clientHeight}
      width={width}
      db={db}
      pattern={pattern || '*'}
      redis={redis}
      onCreateKey={onCreateKey}
      onKeyMetaChange={onKeyMetaChange}
      onSelect={onSelectKey}
    />
    <Footer onDatabaseChange={onDatabaseChange} db={db} redis={redis} />
  </div>)
}

export default memo(KeyBrowser)
