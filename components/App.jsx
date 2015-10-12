'use strict';

import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { addInstance, delInstance } from '../actions';
import { Tab, Tabs } from './draggable-tab';
const id = require('../id');

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div>
      <Tabs
        onTabAddButtonClick={() =>
          this.props.dispatch(addInstance({ key: id('instance'), host: 'localhost' }))
        }
        onTabClose={(_, key) =>
          this.props.dispatch(delInstance(key))
        }
        selectedTab={ this.props.activeInstance.key }
        tabs={this.props.tabs.toJS()}
      />
    </div>;
  }
}

const selector = createSelector(
  state => state.get('instances'),
  state => state.get('activeInstance'),
  (instances, activeInstance) => {
    return {
      tabs: instances.map(function (instance) {
        return (<Tab key={instance.key} title={instance.host} >
          <div>
            <h1>This tab cannot close</h1>
          </div>
        </Tab>);
      }),
      activeInstance
    };
  }
);

export default connect(selector)(App);
