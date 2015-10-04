'use strict';

import React from 'react';

class TabTemplate extends React.Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

TabTemplate.defaultProps = {
  selected: false
};

TabTemplate.propTypes = {
  selected: React.PropTypes.bool.isRequired
};

export default TabTemplate;
