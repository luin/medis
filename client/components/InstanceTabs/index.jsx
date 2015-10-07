'use strict';

import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import action from '../../actions';
import { Tab, Tabs } from './draggable-tab';

class InstanceTabs extends React.Component {
  render() {
    return <Tabs style={ { display: this.props.instances.count() === 1 ? 'none' : 'block' } }
      onTabAddButtonClick={() =>
        this.props.dispatch(action('addInstance'))
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
      selectedTab={ this.props.activeInstanceKey }
      tabs={
        this.props.instances.map(instance => {
          return (<Tab key={instance.get('key')} title={instance.get('host')} ></Tab>);
        }).toJS()
      }
    />;
  }
}

const selector = createSelector(
  state => state.get('instances'),
  state => state.get('activeInstance').get('key'),
  (instances, activeInstanceKey) => {
    return { instances, activeInstanceKey };
  }
);

export default connect(selector)(InstanceTabs);
