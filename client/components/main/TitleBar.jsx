'use strict';

import React from 'react';
import remote from 'remote';

class TitleBar extends React.Component {
  componentDidMount() {
  }

  render() {
    return <header className="toolbar toolbar-header">
      <h1 className="title">{ remote.require('app').getName() }</h1>
    </header>;
  }

  componentWillUnmount() {
  }

}

export default TitleBar;
