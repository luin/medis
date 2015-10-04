'use strict';

import React from 'react/addons';

class CloseIcon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: false
    };
  }

  handleMouseOver() {
    this.setState({ hover: true });
  }

  handleMouseOut() {
    this.setState({ hover: false });
  }

  handleClick(e) {
    this.props.onClick(e);
  }

  render() {
    return (
      <span
        className={this.state.hover ? 'rdTabCloseIcon is-hover' : 'rdTabCloseIcon'}
        onMouseOver={this.handleMouseOver.bind(this)}
        onMouseOut={this.handleMouseOut.bind(this)}
        onClick={this.handleClick.bind(this)}>
        {this.props.children}
      </span>
    );
  }
}

CloseIcon.defaultProps = {
  onClick: () => {}
};

CloseIcon.propTypes = {
  onClick: React.PropTypes.func
};

export default CloseIcon;
