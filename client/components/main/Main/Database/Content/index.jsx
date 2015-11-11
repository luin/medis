'use strict';

import React from 'react';
import TabBar from './TabBar';
import KeyContent from './KeyContent';
import Footer from './Footer';

class Content extends React.Component {
  constructor() {
    super();
    this.state = {
      pattern: '',
      db: 0
    };
  }

  init(keyName) {
    this.props.redis.type(keyName, (err, keyType) => {
      this.setState({ keyType });
    });
  }

  componentDidMount() {
    this.init(this.props.keyName);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyName !== this.props.keyName) {
      this.init(nextProps.keyName);
    }
  }

  handleTabChange() {
  }

  render() {
    return <div className="pane sidebar">
      <TabBar
        onSelectTab={this.handleTabChange.bind(this)}
      />
      <KeyContent
        keyName={this.props.keyName}
        keyType={this.state.keyType}
        height={this.props.height - 67}
        redis={this.props.redis}
      />
      <Footer
        keyName={this.props.keyName}
        keyType={this.state.keyType}
        redis={this.props.redis}
      />
    </div>;
  }
}

export default Content;
