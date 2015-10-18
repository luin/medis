'use strict';

import React from 'react';
import Favorite from './Favorite';
import Config from './Config';

class ConnectionSelector extends React.Component {
  constructor() {
    super();
    this.state = { favorite: null };
  }

  handleSelectFavorite(favorite) {
    this.setState({ favorite });
  }

  render() {
    return <div className="pane-group">
      <aside className="pane pane-sm sidebar">
        <Favorite
          favorites={this.props.favorites}
          onSelect={this.handleSelectFavorite.bind(this)}
        />
        <footer className="toolbar toolbar-footer">
          <h1 className="title">Footer</h1>
        </footer>
      </aside>
      <div className="pane">
        <Config
          favorite={this.state.favorite}
        />
      </div>
    </div>;
  }
}

export default ConnectionSelector;
