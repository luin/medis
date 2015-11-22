'use strict';

import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import InstanceTabs from './InstanceTabs';
import Main from './Main';
import DocumentTitle from 'react-document-title';
import action from '../../actions';
import store from '../../store';

class App extends React.Component {
  componentDidMount() {
    $(window).on('keydown.redis', this.onHotKey.bind(this));
  }

  componentWillUnmount() {
    $(window).off('keydown.redis');
  }

  onHotKey(e) {
    if (!e.ctrlKey && e.metaKey) {
      const code = e.keyCode;
      if (code >= 49 && code <= 57) {
        const number = code - 49;
        if (number === 8) {
          const instance = this.props.instances.get(this.props.instances.count() - 1);
          if (instance) {
            store.dispatch(action('selectInstance', instance.get('key')));
            return false;
          }
        } else {
          const instance = this.props.instances.get(number);
          if (instance) {
            store.dispatch(action('selectInstance', instance.get('key')));
            return false;
          }
        }
      }
    }
    return true;
  }

  render() {
    const { instances, activeInstance, favorites, patternStore } = this.props;

    const version = activeInstance.get('version') ? `(Redis ${activeInstance.get('version')}) ` : '';
    return <DocumentTitle title={version + activeInstance.get('title')}>
      <div className="window">
        <InstanceTabs
          instances={instances}
          activeInstanceKey={activeInstance.get('key')}
        />
        <Main
          instances={instances}
          activeInstanceKey={activeInstance.get('key')}
          favorites={favorites}
          patternStore={patternStore}
        />
      </div>
    </DocumentTitle>;
  }
}

const selector = createSelector(
  state => state.get('instances'),
  state => state.get('activeInstanceKey'),
  state => state.get('favorites'),
  state => state.get('patternStore'),
  (instances, activeInstanceKey, favorites, patternStore) => {
    const activeInstance = instances.find(instance => instance.get('key') === activeInstanceKey);
    return {
      instances,
      activeInstance,
      favorites,
      patternStore
    };
  }
);

export default connect(selector)(App);
