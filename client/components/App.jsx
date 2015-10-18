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
    const { instances, activeInstance, favorites } = this.props;

    return <div className="window">
      <InstanceTabs
        instances={instances}
        activeInstanceKey={activeInstance.get('key')}
      />
      <Main
        instances={instances}
        activeInstanceKey={activeInstance.get('key')}
        favorites={favorites}
      />
    </div>;
  }
}

const selector = createSelector(
  state => state.get('instances'),
  state => state.get('activeInstanceKey'),
  state => state.get('favorites'),
  (instances, activeInstanceKey, favorites) => {
    const activeInstance = instances.find(instance => instance.get('key') === activeInstanceKey);
    return {
      instances,
      activeInstance,
      favorites
    };
  }
);

export default connect(selector)(App);
