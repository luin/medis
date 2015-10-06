'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import DraggableList from '../common/DraggableList';

class Favourite extends React.Component {
  componentDidMount() {
  }

  render() {
    return <nav className="nav-group">
      <h5 className="nav-group-title"></h5>
      <a className="nav-group-item active">
        <span className="icon icon-flash"></span>
        QUICK CONNECT
      </a>
      <h5 className="nav-group-title">FAVORITES</h5>
      <DraggableList>
      {
        this.props.favourites.map(favourite => {
          return <a
            key={favourite.name}
            className="nav-group-item active"
          >
            <span className="icon icon-home"></span>
            {favourite.name}
          </a>;
        })
      }
      </DraggableList>
    </nav>;
  }

  componentWillUnmount() {
  }

}

const selector = createSelector(
  state => state.get('favourites'),
  (favourites) => {
    return {
      favourites: [
        { name: 'item1' },
        { name: 'item2' },
        { name: 'item3' },
      ]
    };
  }
);

export default connect(selector)(Favourite);
