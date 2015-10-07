'use strict';

import React from 'react';
import Favourite from './Favourite';
import store from '../../store';
import { Provider } from 'react-redux';
import action from '../../actions';

class ConnectionSelector extends React.Component {
  componentDidMount() {
  }

  render() {
    return <div className="pane-group">
      <aside className="pane pane-sm sidebar">
        <Provider store={store}>
          {() => <Favourite />}
        </Provider>
        <footer className="toolbar toolbar-footer">
          <h1 className="title">Footer</h1>
        </footer>
      </aside>
      <div className="pane">
        <button onClick={() =>
          store.dispatch(action('connect'))
        }>Connect</button>
      </div>
    </div>;
  }

  componentWillUnmount() {
  }

}

export default ConnectionSelector;
