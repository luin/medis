'use strict';

import React from 'react';
import PropTypes from 'prop-types';

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
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]).isRequired,
  disableClose: PropTypes.bool
};

export default Tab;
