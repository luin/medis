'use strict';

import React from 'react';

class Favourite extends React.Component {
  componentDidMount() {
    $(React.findDOMNode(this)).sortable();
  }

  render() {
    return <nav className="nav-group">
      <h5 className="nav-group-title"></h5>
      <a className="nav-group-item active">
        <span className="icon icon-flash"></span>
        QUICK CONNECT
      </a>
      <h5 className="nav-group-title">FAVORITES</h5>
      {
        this.props.favourites.map(favourite => {
          return <a
            key={favourite.name}
            className="nav-group-item"
          >
            <span className="icon icon-home"></span>
            {favourite.name}
          </a>;
        })
      }
    </nav>;
  }

  componentWillUnmount() {
  }
}

export default Favourite;
