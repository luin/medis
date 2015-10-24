'use strict';

import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import store from '../../store';
import actions from '../../actions';
import Sortable from 'sortablejs';
import {
  Window,
  TitleBar,
  PushButton,
  TextField,
  Toolbar,
  Box,
  SegmentedControl,
  IndeterminateCircularProgressIndicator,
  Form,
  Label
} from 'react-desktop';

require('./app.scss');

const connectionKey = getParameterByName('arg');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: this.props.patterns[0] ? this.props.patterns[0].key : null
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

  onClick(index, evt) {
    evt.preventDefault();
    this.setState({ activeKey: this.props.patterns[index].key });
  }

  render() {
    const { patterns } = this.props;
    let activePattern;
    let activeIndex;
    for (let i = 0; i < patterns.length; i++) {
      if (patterns[i].key === this.state.activeKey) {
        activePattern = patterns[i];
        activeIndex = i;
        break;
      }
    }

    return <div className="window">
      <div className="patternList">
        <div ref="sortable" key={this.sortableKey}>{
          patterns.map((pattern, index) => {
            return <a
              key={pattern.key}
              className={'nav-group-item' + (pattern.key === this.state.activeKey ? ' is-active' : '')}
              onClick={this.onClick.bind(this, index)}
            >
              <span>{pattern.value}</span>
            </a>;
          })
        }</div>
        <footer>
          <button
            onClick={() => {
              store.dispatch(actions('addPattern', { store: connectionKey }, pattern => {
                this.setState({ activeKey: pattern.get('key') });
              }));
            }}
          >+</button>
          <button
            className={activePattern ? '' : 'is-disabled'}
            onClick={() => {
              if (activePattern) {
                store.dispatch(actions('removePatternStore', { store: connectionKey, key: activePattern.key }));
                if (activeIndex >= 1) {
                  this.setState({ activeKey: this.props.patterns[activeIndex - 1].key });
                } else if (this.props.patterns.length > 1) {
                  this.setState({ activeKey: this.props.patterns[1].key });
                } else {
                  this.setState({ activeKey: null });
                }
              }
            }}
          >-</button>
        </footer>
      </div>
      <div className="form" style={ { display: activePattern ? 'block' : 'none' } }>
        <Box>
          <Form onSubmit={() => {}}>
            <Form.Row>
              <Label>Name</Label>
              <TextField defaultValue={activePattern && activePattern.name} placeholder=""/>
            </Form.Row>
            <Form.Row>
              <Label>Pattern</Label>
              <TextField defaultValue={activePattern && activePattern.value} placeholder=""/>
            </Form.Row>
            <Form.Row>
              <PushButton onPress="submit" color="blue">Save</PushButton>
            </Form.Row>
          </Form>
        </Box>
      </div>
    </div>;
  }
}

const selector = createSelector(
  state => state.get('patternStore'),
    (patternStore) => {
      let patterns = patternStore.get(connectionKey);
      patterns = patterns ? patterns.toJS() : [];
      return { patterns };
    }
);

export default connect(selector)(App);

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
