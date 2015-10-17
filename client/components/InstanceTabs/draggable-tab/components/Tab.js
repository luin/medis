'use strict';

import React from 'react';

class Tab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return this.props.children;
  }
}

Tab.defaultProps = {
  title: 'Quick Connect',
  disableClose: false
};

Tab.propTypes = {
  title: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.element
  ]).isRequired,
  disableClose: React.PropTypes.bool
};

export default Tab;
