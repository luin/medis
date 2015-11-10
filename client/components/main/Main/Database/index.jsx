'use strict';

import React from 'react';
import store from '../../../../store';
import action from '../../../../actions';
import SplitPane from 'react-split-pane';
import KeyBrowser from './KeyBrowser';
import Content from './Content';
require('./index.scss');

class Database extends React.Component {
  constructor() {
    super();
    this.$window = $(window);

    this.state = {
      sidebarWidth: 300,
      key: null,
      clientHeight: this.$window.height()
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateLayout.bind(this), false);
    this.updateLayout();
  }

  updateLayout() {
    this.setState({ clientHeight: this.$window.height() });
  }

  render() {
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
      <KeyBrowser
        patternStore={ this.props.patternStore }
        height={ this.state.clientHeight }
        width= { this.state.sidebarWidth }
        redis={ this.props.redis }
        connectionKey={ this.props.connectionKey }
        onSelectKey={ key => this.setState({ key }) }
      />
      <Content
        keyName={ this.state.key }
        height={ this.state.clientHeight }
        redis={ this.props.redis }
      />
  </SplitPane>;
  }
}

export default Database;
