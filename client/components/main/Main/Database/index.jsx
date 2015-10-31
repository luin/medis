'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import store from '../../../../store';
import action from '../../../../actions';
import SplitPane from 'react-split-pane';
import PatternList from './PatternList';
import KeyList from './KeyList';
require('./index.scss');

class Database extends React.Component {
  constructor() {
    super();
    this.footerHeight = 66;

    this.state = {
      sidebarWidth: 300,
      clientHeight: $(window).height() - this.footerHeight,
      pattern: ''
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
    return <SplitPane
        className="pane-group"
        minSize="100"
        split="vertical"
        defaultSize={300}
        ref="node"
        onChange={size => {
          this.setState({ sidebarWidth: size });
        }}
      >
      <div className="pane sidebar">
        <PatternList
          patterns={ this.props.patterns }
          height={ this.state.clientHeight }
          onChange={pattern => {
            console.log('pattern', pattern);
            this.setState({ pattern });
          }}
        />
        <KeyList
          height={ this.state.clientHeight }
          width= { this.state.sidebarWidth }
          db={ 0 }
          pattern={ this.state.pattern || '*' }
          redis={ this.props.redis }
          onSelect={key => {
            console.log(`Select ${key}`);
          }}
        />
        <footer className="toolbar toolbar-footer">
        </footer>
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
