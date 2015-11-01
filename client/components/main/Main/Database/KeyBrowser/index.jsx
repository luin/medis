'use strict';

import React from 'react';
import Immutable from 'immutable';
import PatternList from './PatternList';
import KeyList from './KeyList';
import Footer from './Footer';

class KeyBrowser extends React.Component {
  constructor() {
    super();
    this.footerHeight = 66;

    this.state = {
      pattern: '',
      db: 0
    };
  }

  handleSelectPattern() {
  }

  render() {
    const { patternStore, connectionKey } = this.props;
    const patterns = patternStore.get(`${connectionKey}|${this.state.db}`) || Immutable.List();
    return <div className="pane sidebar">
      <PatternList
        patterns={ patterns }
        height={ this.props.height - this.footerHeight }
        connectionKey={ this.props.connectionKey }
        db={ this.state.db }
        onChange={pattern => {
          this.setState({ pattern });
        }}
      />
      <KeyList
        height={ this.props.height - this.footerHeight }
        width= { this.props.width }
        db={ this.state.db }
        pattern={ this.state.pattern || '*' }
        redis={ this.props.redis }
        onSelect={key => {
          this.props.onSelectKey(key);
        }}
      />
      <Footer
        onDatabaseChange={newDB => {
          this.setState({ db: newDB });
        }}
        redis={ this.props.redis }
      />
    </div>;
  }
}

export default KeyBrowser;
