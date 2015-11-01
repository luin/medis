'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';
import store from '../../../../store';
import action from '../../../../actions';
import SplitPane from 'react-split-pane';
import PatternList from './PatternList';
import KeyList from './KeyList';
import Footer from './Footer';
require('./index.scss');

class Database extends React.Component {
  constructor() {
    super();
    this.footerHeight = 66;

    this.state = {
      sidebarWidth: 300,
      clientHeight: $(window).height() - this.footerHeight,
      pattern: '',
      db: 0
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this._update.bind(this), false);
    this._update();
  }

  _update() {
    const node = ReactDOM.findDOMNode(this);
    this.setState({ clientHeight: node.clientHeight - this.footerHeight });
  }

  handleSelectPattern() {
  }

  render() {
    const { patternStore, connectionKey } = this.props;
    const patterns = patternStore.get(`${connectionKey}|${this.state.db}`) || Immutable.List();
    return <SplitPane
        className="pane-group"
        minSize="250"
        split="vertical"
        defaultSize={300}
        ref="node"
        onChange={size => {
          this.setState({ sidebarWidth: size });
        }}
      >
      <div className="pane sidebar">
        <PatternList
          patterns={ patterns }
          height={ this.state.clientHeight }
          connectionKey={ this.props.connectionKey }
          db={ this.state.db }
          onChange={pattern => {
            this.setState({ pattern });
          }}
        />
        <KeyList
          height={ this.state.clientHeight }
          width= { this.state.sidebarWidth }
          db={ this.state.db }
          pattern={ this.state.pattern || '*' }
          redis={ this.props.redis }
          onSelect={key => {
            console.log(`Select ${key}`);
          }}
        />
        <Footer
          onDatabaseChange={newDB => {
            this.setState({ db: newDB });
          }}
          redis={ this.props.redis }
        />
      </div>
      <div className="pane">
        <button onClick={() =>
          store.dispatch(action('connect'))
        }>Connect</button>
      </div>
  </SplitPane>;
  }
}

export default Database;
