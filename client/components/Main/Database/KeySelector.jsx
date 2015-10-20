'use strict';

import React from 'react';
import store from '../../../store';
window.store = store;
import actions from '../../../actions';
window.actions = actions;
import Immutable from 'immutable';
import Sortable from 'sortablejs';

class KeySelector extends React.Component {
  constructor() {
    super();
    this.state = {
      editable: Immutable.List(),
      activeKey: null
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
        store.dispatch(actions('reorderKeySelectors', { from: evt.oldIndex, to: evt.newIndex }));
      }
    });
  }

  componentDidMount() {
    this._bindSortable();
  }

  componentDidUpdate() {
    this._bindSortable();
  }

  onClick(index, evt) {
    evt.preventDefault();
    this.selectIndex(index);
  }

  selectIndex(index) {
    this.select(index === -1 ? null : this.props.favorites.get(index));
  }

  select(favorite) {
    this.setState({ activeKey: favorite ? favorite.get('key') : null });
    this.props.onSelect(favorite);
  }

  render() {
    return <div style={ { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'hidden' } }>
      <nav className="nav-group">
        <h5 className="nav-group-title"></h5>
        <a className={'nav-group-item' + (this.state.activeKey ? '' : ' active')} onClick={this.onClick.bind(this, -1)}>
          <span className="icon icon-flash"></span>
          QUICK CONNECT
        </a>
        <h5 className="nav-group-title">FAVORITES</h5>
        <div ref="sortable" key={this.sortableKey}>{
          this.props.favorites.map((favorite, index) => {
            return <a
              key={favorite.get('key')}
              className={'nav-group-item' + (favorite.get('key') === this.state.activeKey ? ' active' : '')}
              onClick={this.onClick.bind(this, index)}
            >
              <span className="icon icon-home"></span>
              <span>{favorite.get('name')}</span>
            </a>;
          })
        }</div>
      </nav>
      <footer className="toolbar toolbar-footer">
        <button onClick={
          store.dispatch.bind(null, actions('addKeySelector', favorite => {
            this.select(favorite);
          }))
        }>+</button>
        <button onClick={
          () => {
            const key = this.state.activeKey;
            if (!key) {
              return;
            }
            const index = this.props.favorites.findIndex(favorite => key === favorite.get('key'));
            store.dispatch(actions('removeKeySelector', { key }));
            this.selectIndex(index - 1);
          }
        }>-</button>
      </footer>
    </div>;
  }

  componentWillUnmount() {
    this.sortable.destroy();
  }
}

export default KeySelector;
