'use strict';

import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import TitleBar from './TitleBar';
import InstanceTabs from './InstanceTabs';
import Main from './Main';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { instances, activeInstance, favourites } = this.props;

    return <div className="window">
      <TitleBar />
      <InstanceTabs
        instances={instances}
        activeInstanceKey={activeInstance.get('key')}
      />
      <Main
        instances={instances}
        activeInstanceKey={activeInstance.get('key')}
        favourites={favourites}
      />
    </div>;
  }
}

const selector = createSelector(
  state => state.get('instances'),
  state => state.get('activeInstanceKey'),
  state => state.get('favourites'),
  (instances, activeInstanceKey, favourites) => {
    const activeInstance = instances.find(instance => instance.get('key') === activeInstanceKey);
    return {
      instances,
      activeInstance,
      favourites
    };
  }
);

export default connect(selector)(App);
