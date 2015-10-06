'use strict';

import React from 'react';
import { createSelector } from 'reselect';
import { connect } from 'react-redux';
import ConnectionSelector from '../ConnectionSelector';
import Database from '../Database';

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
          style={ { display: instance.get('key') === activeInstance.get('key') ? 'block' : 'none' } }>
          {
            instance.get('redis') ?
              <Database redis={instance.get('redis')} /> :
              <ConnectionSelector key={instance.get('key')} title={instance.get('host')} />
          }
        </div>;
      })
    };
  }
);

export default connect(selector)(MainContent);
