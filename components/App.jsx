'use strict';

import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { addInstance } from '../actions';
import { Tab, Tabs } from './draggable-tab';

class App extends React.Component {
  render() {
    return <div>
      <Tabs
        onTabAddButtonClick={() =>
          this.props.dispatch(addInstance({ host: 'localhost' }))
        }
        tabs={this.props.tabs.toJS()}
      />
    </div>;
  }
}

const selector = createSelector(
  state => state.get('tabs'),
  (tabs) => {
    return {
      tabs: tabs.map(function (instance, index) {
        return (<Tab key={'tab' + index + 1} title={instance.host} >
          <div>
            <h1>This tab cannot close</h1>
          </div>
        </Tab>);
      })
    };
  }
);

export default connect(selector)(App);
