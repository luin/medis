'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

class Favourite extends React.Component {
  componentDidMount() {
  }

  render() {
    return <nav className="nav-group">
      <h5 className="nav-group-title">Favorites</h5>
      <a className="nav-group-item active">
        <span className="icon icon-home"></span>
        connors
      </a>
      <a className="nav-group-item">
        <span className="icon icon-home"></span>
        connors {Math.random() * 100 | 0}
      </a>
    </nav>;
  }

  componentWillUnmount() {
  }

}

const selector = createSelector(
  state => state.get('favourites'),
  (favourites) => {
    return {
      favourites
    };
  }
);

export default connect(selector)(Favourite);
