'use strict';

import React from 'react';
import store from '../../../store';
window.store = store;
import actions from '../../../actions';
window.actions = actions;
import Immutable from 'immutable';
import remote from 'remote';
import Sortable from 'sortablejs';
const Menu = remote.require('menu');
const MenuItem = remote.require('menu-item');

class Favorite extends React.Component {
  constructor() {
    super();
    this.state = {
      editable: Immutable.List(),
      activeIndex: null
    };

    const _this = this;
    this.menu = new Menu();
    this.menu.append(new MenuItem({
      label: 'Rename',
      click() {
        const index = _this.contextMenuIndex;
        _this.setState({
          editable: _this.state.editable.set(index, _this.props.favorites.getIn([index, 'name']))
        });
      }
    }));
    this.menu.append(new MenuItem({ type: 'separator' }));
    this.menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }));
  }

  componentDidMount() {
    this.sortable = Sortable.create(React.findDOMNode(this.refs.sortable), {
      // animation: 150,
      onStart: evt => {
        this.nextSibling = evt.item.nextElementSibling;
      },
      onAdd: evt => {
        evt.from.insertBefore(evt.item, this.nextSibling);
      },
      onUpdate: evt => {
        evt.from.insertBefore(evt.item, this.nextSibling);
        store.dispatch(actions('reorderFavorites', { from: evt.oldIndex, to: evt.newIndex }));
      }
    });
  }

  onContextMenu(index, e) {
    e.preventDefault();
    this.contextMenuIndex = index;
    this.menu.popup(remote.getCurrentWindow());
  }

  onChange(index, e) {
    this.setState({
      editable: this.state.editable.set(this.state.activeIndex, e.target.value)
    });
  }

  onClick(index) {
    this.setState({
      activeIndex: index
    });
  }

  onBlur(index, e) {
    this.setState({
      editable: this.state.editable.set(this.state.activeIndex, null)
    });
    store.dispatch(actions('updateFavorite', { index, name: e.target.value }));
  }

  render() {
    return <nav className="nav-group">
      <h5 className="nav-group-title"></h5>
      <a className="nav-group-item active">
        <span className="icon icon-flash"></span>
        QUICK CONNECT
      </a>
      <h5 className="nav-group-title" onClick={store.dispatch.bind(null, actions('addFavorite'))}>FAVORITES</h5>
      <div ref="sortable">
      {
        this.props.favorites.map((favorite, index) => {
          return <a
            key={favorite.get('key')}
            className={'nav-group-item' + (index === this.state.activeIndex ? ' active' : '')}
            onContextMenu={this.onContextMenu.bind(this, index)}
            onClick={this.onClick.bind(this, index)}
          >
            <span className="icon icon-home"></span>
            <span
              style={ { display: this.state.editable.get(index) ? 'none' : 'block' } }
              >{favorite.get('name')}</span>
            <input
              style={ { display: this.state.editable.get(index) ? 'block' : 'none' } }
              onChange={this.onChange.bind(this, index)}
              onBlur={this.onBlur.bind(this, index)}
              type="text"
            />
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
