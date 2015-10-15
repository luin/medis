'use strict';

import React from 'react';

class TitleBar extends React.Component {
  componentDidMount() {
  }

  render() {
    return <header className="toolbar toolbar-header">
      <h1 className="title">Photon</h1>
    </header>;
  }

  componentWillUnmount() {
  }

}

export default TitleBar;
