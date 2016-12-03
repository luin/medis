'use strict';

import React from 'react';
import Favorite from './Favorite';
import Config from './Config';
import store from '../../../../store';
import actions from '../../../../actions';

class ConnectionSelector extends React.Component {
  constructor() {
    super();
    this.state = { connect: false, key: null };
  }

  handleSelectFavorite(connect, key) {
    this.setState({ connect, key });
  }

  render() {
    const selectedFavorite = this.state.key && this.props.favorites.find(item => item.get('key') === this.state.key);
    return <div className="pane-group">
      <aside className="pane pane-sm sidebar">
        <Favorite
          favorites={this.props.favorites}
          onSelect={this.handleSelectFavorite.bind(this, false)}
          onRequireConnecting={this.handleSelectFavorite.bind(this, true)}
        />
      </aside>
      <div className="pane">
        <Config
          favorite={selectedFavorite}
          connectStatus={this.props.connectStatus}
          connect={this.state.connect}
          onSave={(data) => {
            store.dispatch(actions('updateFavorite', { key: selectedFavorite.get('key'), data }));
          }}
          onDuplicate={(data) => {
            store.dispatch(actions('addFavorite', data, () => {}));
          }}
        />
      </div>
    </div>;
  }
}

export default ConnectionSelector;
