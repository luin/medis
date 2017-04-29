'use strict';

import React from 'react';
import {createSelector} from 'reselect';
import {Provider, connect} from 'react-redux';
import InstanceTabs from './components/InstanceTabs';
import InstanceContent from './components/InstanceContent';
import DocumentTitle from 'react-document-title';
import action from '../../actions';
import store from '../../store';

class MainWindow extends React.Component {
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

  getTitle() {
    const {activeInstance} = this.props;
    const version = activeInstance.get('version')
      ? `(Redis ${activeInstance.get('version')}) `
      : ''

    return version + activeInstance.get('title')
  }

  render() {
    const { instances, activeInstance, favorites, patternStore } = this.props;
    return <DocumentTitle title={this.getTitle()}>
      <div className="window">
        <InstanceTabs
          instances={instances}
          activeInstanceKey={activeInstance.get('key')}
        />
        <InstanceContent
          instances={instances}
          activeInstanceKey={activeInstance.get('key')}
        />
      </div>
    </DocumentTitle>;
  }
}

const selector = createSelector(
  state => state.get('instances'),
  state => state.get('activeInstanceKey'),
  (instances, activeInstanceKey) => {
    return {
      instances,
      activeInstance: instances.find(instance => instance.get('key') === activeInstanceKey)
    };
  }
);

const MainWindowContainer = connect(selector)(MainWindow);

export default <Provider store={store}>
  <MainWindowContainer />
</Provider>
