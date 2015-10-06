'use strict';

import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import { addInstance, delInstance, moveInstance, selectInstance } from '../actions';
import { Tab, Tabs } from './draggable-tab';
import ConnectionSelector from './connection-selector/ConnectionSelector';
import TitleBar from './TitleBar';
import id from '../id';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div>
      <TitleBar />
      <Tabs
        onTabAddButtonClick={() =>
          this.props.dispatch(addInstance({ key: id('instance'), host: 'localhost' }))
        }
        onTabSelect={(key) =>
          this.props.dispatch(selectInstance(key))
        }
        onTabClose={(key) =>
          this.props.dispatch(delInstance(key))
        }
        onTabPositionChange={(from, to) =>
          this.props.dispatch(moveInstance({ from, to }))
        }
        selectedTab={ this.props.activeInstance.key }
        tabs={this.props.tabs}
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
          <div style={ { display: instance.key === activeInstance.key ? 'block' : 'none' } }>
            <ConnectionSelector
            />
          </div>
        </Tab>);
      }),
      activeInstance
    };
  }
);

export default connect(selector)(App);
