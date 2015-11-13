'use strict';

import React from 'react';
import action from '../../../actions';
import store from '../../../store';
import { Tab, Tabs } from './draggable-tab';

class InstanceTabs extends React.Component {
  constructor() {
    super();
    this.style = 'block';
  }

  render() {
    const style = this.props.instances.count() === 1 ? 'none' : 'block';
    if (this.style !== style) {
      this.style = style;
      setTimeout(function () {
        $(window).trigger('resize');
      }, 0);
    }
    return <div style={ { display: this.style } }>
      <Tabs
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
            return (<Tab key={instance.get('key')} title={instance.get('title')} ></Tab>);
          }).toJS()
        }
      />
    </div>;
  }
}

export default InstanceTabs;
