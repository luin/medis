'use strict';

import React from 'react';
import action from '../../actions';
import store from '../../store';
import { Tab, Tabs } from './draggable-tab';

class InstanceTabs extends React.Component {
  render() {
    return <Tabs style={ { display: this.props.instances.count() === 1 ? 'none' : 'block' } }
      onTabAddButtonClick={() =>
        store.dispatch(action('addInstance'))
      }
      onTabSelect={(key) =>
        store.dispatch(action('selectInstance', key))
      }
      onTabClose={(key) =>
        store.dispatch(action('delInstance', key))
      }
      onTabPositionChange={(from, to) =>
        store.dispatch(action('moveInstance', { from, to }))
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

export default InstanceTabs;
