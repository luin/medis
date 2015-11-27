'use strict';

import React from 'react';

require('./TabBar.scss');

class Content extends React.Component {
  constructor() {
    super();

    this.tabs = [
      'Content',
      'Terminal',
      'Config'
    ];

    this.state = { activeTab: 'Content' };
  }

  render() {
    return <div className="TabBar">
      {
        this.tabs.map(tab => {
          return <div
            className={ 'item' + (tab === this.state.activeTab ? ' is-active' : '') }
            key={tab}
            onClick={ () => {
              this.setState({ activeTab: tab });
              this.props.onSelectTab(tab);
            } }
            >{tab}</div>;
        })
      }
    </div>;
  }
}

export default Content;
