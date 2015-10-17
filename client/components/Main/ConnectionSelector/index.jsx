'use strict';

import React from 'react';
import Favourite from './Favourite';
import store from '../../../store';
import action from '../../../actions';

class ConnectionSelector extends React.Component {
  render() {
    return <div className="pane-group">
      <aside className="pane pane-sm sidebar">
        <Favourite favourites={this.props.favourites} />
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
}

export default ConnectionSelector;
