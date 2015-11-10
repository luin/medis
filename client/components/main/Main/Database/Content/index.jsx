'use strict';

import React from 'react';
import TabBar from './TabBar';
import KeyContent from './KeyContent';

class Content extends React.Component {
  constructor() {
    super();
    this.state = {
      pattern: '',
      db: 0
    };
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
        height={this.props.height - 67}
        redis={this.props.redis}
      />
    </div>;
  }
}

export default Content;
