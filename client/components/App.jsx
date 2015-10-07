'use strict';

import React from 'react';
import { Provider } from 'react-redux';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import TitleBar from './TitleBar';
import InstanceTabs from './InstanceTabs';
import MainContent from './MainContent';
import store from '../store';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="window">
      <TitleBar style={ { display: 'none' } } />
      <Provider store={store}>
        {() => <InstanceTabs />}
      </Provider>
      <Provider store={store}>
        {() => <MainContent />}
      </Provider>
    </div>;
  }
}

const selector = createSelector(
  state => state.get('instances'),
  (instances) => {
    return {
      instances
    };
  }
);

export default connect(selector)(App);
