'use strict';

import React from 'react';
import store from '../../../store';
window.store = store;
import actions from '../../../actions';
window.actions = actions;
import Sortable from 'sortablejs';

class KeySelector extends React.Component {
  constructor() {
    super();
    this.state = {
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
        store.dispatch(actions('reorderPatternStores', {
          store: this.props.connectionKey,
          from: evt.oldIndex,
          to: evt.newIndex
        }));
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
    this.select(index === -1 ? null : this.props.patterns.get(index));
  }

  select(patterns) {
    this.setState({ activeKey: patterns ? patterns.get('key') : null });
    this.props.onSelect(patterns);
  }

  render() {
    return <div style={ { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'hidden' } }>
      <nav className="nav-group">
        <h5 className="nav-group-title"></h5>
        <a className={'nav-group-item' + (this.state.activeKey ? '' : ' active')} onClick={this.onClick.bind(this, -1)}>
          <span className="icon icon-flash"></span>
          ALL KEYS
        </a>
        <h5 className="nav-group-title">PATTERNS</h5>
        <div ref="sortable" key={this.sortableKey}>{
          this.props.patterns.map((patterns, index) => {
            return <a
              key={patterns.get('key')}
              className={'nav-group-item' + (patterns.get('key') === this.state.activeKey ? ' active' : '')}
              onClick={this.onClick.bind(this, index)}
            >
              <span className="icon icon-home"></span>
              <span>{patterns.get('name')}</span>
            </a>;
          })
        }</div>
      </nav>
      <footer className="toolbar toolbar-footer">
        <button onClick={
          store.dispatch.bind(null, actions('addPattern', { store: this.props.connectionKey }, pattern => {
            this.select(pattern);
          }))
        }>+</button>
        <button onClick={
          () => {
            const key = this.state.activeKey;
            if (!key) {
              return;
            }
            const index = this.props.patterns.findIndex(patterns => key === patterns.get('key'));
            store.dispatch(actions('removePatternStore', { key, store: this.props.connectionKey }));
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
