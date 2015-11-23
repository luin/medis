'use strict';

import React from 'react';
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
      db: 0,
      clientHeight: this.$window.height()
    };
  }

  componentDidMount() {
    this.updateLayoutBinded = this.updateLayout.bind(this);
    $(window).on('resize', this.updateLayoutBinded);
    this.updateLayout();
  }

  componentWillUnmount() {
    $(window).off('resize', this.updateLayoutBinded);
  }

  updateLayout() {
    this.setState({ clientHeight: $(window).height() - $('.tab-group').height() - 2 });
  }

  handleCreateKey(res) {
    const key = res['Key Name:'];
    const type = res['Type:'];
    this.setState({ key, type })
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
        onCreateKey={ this.handleCreateKey.bind(this) }
        db={ this.state.db }
        onDatabaseChange={ db => this.setState({ db }) }
      />
      <Content
        height={ this.state.clientHeight }
        keyName={ this.state.key }
        keyType={ this.state.type }
        connectionKey={ this.props.connectionKey }
        redis={ this.props.redis }
        db={ this.state.db }
        onDatabaseChange={ db => this.setState({ db }) }
      />
    </SplitPane>;
  }
}

export default Database;
