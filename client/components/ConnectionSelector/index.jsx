'use strict';

import React from 'react';
import Favourite from '../Favourite';
import store from '../../store';
import { Provider } from 'react-redux';

class ConnectionSelector extends React.Component {
  componentDidMount() {
  }

  render() {
    return <div className="pane-group">
      <aside className="pane pane-sm sidebar">
        <Provider store={store}>
          {() => <Favourite />}
        </Provider>
      </aside>
      <div className="pane">
      </div>
    </div>;
  }

  componentWillUnmount() {
  }

}

export default ConnectionSelector;
