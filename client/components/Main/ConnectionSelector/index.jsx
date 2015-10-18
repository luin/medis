'use strict';

import React from 'react';
import Favorite from './Favorite';
import Config from './Config';
import Immutable from 'immutable';

class ConnectionSelector extends React.Component {
  constructor() {
    super();
    this.state = {
      favorite: null,
      favoriteOverrides: Immutable.Map()
    };
  }

  getOverride() {
    if (this.state.favorite) {
      return this.state.favoriteOverrides.get(this.state.favorite.get('key'));
    }
  }

  handleSelectFavorite(favorite) {
    this.setState({ favorite });
  }

  handleStoreOverride(key, data) {
    this.state.favoriteOverrides.set(key, data);
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
          override={this.getOverride()}
          onStoreOverride={this.handleStoreOverride.bind(this)}
        />
      </div>
    </div>;
  }
}

export default ConnectionSelector;
