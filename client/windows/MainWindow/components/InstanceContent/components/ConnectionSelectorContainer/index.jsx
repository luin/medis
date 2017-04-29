'use strict';

import React from 'react';
import {Provider, connect} from 'react-redux';
import Favorite from './components/Favorite';
import { createSelector } from 'reselect';
import Config from './components/Config';
import store from '../../../../../../store';
import {updateFavorite, addFavorite} from '../../../../../../actions';

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
    const {onUpdateFavorite, onAddFavorite} = this.props
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
          onSave={onUpdateFavorite.bind(null, selectedFavorite.get('key'))}
          onDuplicate={onAddFavorite}
        />
      </div>
    </div>;
  }
}

const selector = createSelector(
  state => state.get('favorites'),
  (state, props) => props.instance,
  (favorites, instance) => {
    return {
      favorites,
      connectStatus: instance.get('connectStatus')
    };
  }
);

const mapDispatchToProps = {
  onUpdateFavorite: updateFavorite,
  onAddFavorite: addFavorite
}

const ConnectionSelectorContainer = connect(selector, mapDispatchToProps)(ConnectionSelector);

export default (props) => {
  return <Provider store={store}>
    <ConnectionSelectorContainer {...props} />
  </Provider>
}
