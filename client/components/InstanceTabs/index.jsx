'use strict';

import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import action from '../../actions';
import { Tab, Tabs } from './draggable-tab';
import id from '../../id';

class InstanceTabs extends React.Component {
  render() {
    return <Tabs
      onTabAddButtonClick={() =>
        this.props.dispatch(action('addInstance', { key: id('instance'), host: 'localhost' }))
      }
      onTabSelect={(key) =>
        this.props.dispatch(action('selectInstance', key))
      }
      onTabClose={(key) =>
        this.props.dispatch(action('delInstance', key))
      }
      onTabPositionChange={(from, to) =>
        this.props.dispatch(action('moveInstance', { from, to }))
      }
      selectedTab={ this.props.activeInstance.key }
      tabs={this.props.tabs}
    />;
  }
}

const selector = createSelector(
  state => state.get('instances'),
    state => state.get('activeInstance'),
    (instances, activeInstance) => {
    return {
      tabs: instances.map(function (instance) {
        return (<Tab key={instance.key} title={instance.host} ></Tab>);
      }),
      activeInstance
    };
  }
);

export default connect(selector)(InstanceTabs);
