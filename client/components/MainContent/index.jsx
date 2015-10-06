'use strict';

import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import ConnectionSelector from '../ConnectionSelector';

class MainContent extends React.Component {
  render() {
    return <div className="main">{ this.props.contents.toJS() }</div>;
  }
}

const selector = createSelector(
  state => state.get('instances'),
    state => state.get('activeInstance'),
    (instances, activeInstance) => {
    return {
      contents: instances.map(function (instance) {
        return <div
          style={ { display: instance.key === activeInstance.key ? 'block' : 'none' } }>
          <ConnectionSelector key={instance.key} title={instance.host} />
        </div>;
      })
    };
  }
);

export default connect(selector)(MainContent);
