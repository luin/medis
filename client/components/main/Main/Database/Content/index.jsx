'use strict';

import React from 'react';
import TabBar from './TabBar';

class Content extends React.Component {
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
    return <div className="pane sidebar">
      <TabBar
      />
    </div>;
  }
}

export default Content;
