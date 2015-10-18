'use strict';

import React from 'react';
import store from '../../../store';
window.store = store;
import actions from '../../../actions';
window.actions = actions;
import Immutable from 'immutable';
import Sortable from 'sortablejs';

class Favorite extends React.Component {
  constructor() {
    super();
    this.state = {
      editable: Immutable.List(),
      activeIndex: null
    };
    this._updateSortableKey();
  }

  _updateSortableKey() {
    this.sortableKey = `sortable-${Math.round(Math.random() * 10000)}`;
  }

  _bindSortable() {
    this.sortable = Sortable.create(this.refs.sortable, {
      animation: 100,
      onStart: evt => {
        this.nextSibling = evt.item.nextElementSibling;
      },
      onAdd: () => {
        this._updateSortableKey();
      },
      onUpdate: evt => {
        this._updateSortableKey();
        store.dispatch(actions('reorderFavorites', { from: evt.oldIndex, to: evt.newIndex }));
      }
    });
  }

  componentDidMount() {
    this._bindSortable();
  }

  componentDidUpdate() {
    this._bindSortable();
  }

  onClick(activeIndex, evt) {
    evt.preventDefault();
    this.setState({ activeIndex });
  }

  render() {
    return <nav className="nav-group">
      <h5 className="nav-group-title"></h5>
      <a className="nav-group-item active">
        <span className="icon icon-flash"></span>
        QUICK CONNECT
      </a>
      <h5 className="nav-group-title" onClick={store.dispatch.bind(null, actions('addFavorite'))}>FAVORITES</h5>
      <div ref="sortable" key={this.sortableKey}>
      {
        this.props.favorites.map((favorite, index) => {
          return <a
            key={favorite.get('key')}
            className={'nav-group-item' + (index === this.state.activeIndex ? ' active' : '')}
            onClick={this.onClick.bind(this, index)}
          >
            <span className="icon icon-home"></span>
            <span>{favorite.get('key')}</span>
          </a>;
        })
      }
    </div>
    </nav>;
  }

  componentWillUnmount() {
    this.sortable.destroy();
  }
}

export default Favorite;
