'use strict';

import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import InstanceTabs from './InstanceTabs';
import Main from './Main';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { instances, activeInstance, favorites, patternStore } = this.props;

    return <div className="window">
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
    </div>;
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
