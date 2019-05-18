'use strict'

import React, {PureComponent} from 'react'
import {connect} from 'react-redux'
import Favorite from './Favorite'
import Config from './Config'
import {connectToRedis} from 'Redux/actions'
import {removeFavorite, updateFavorite, createFavorite, reorderFavorites} from 'Redux/actions'

class ConnectionSelector extends PureComponent {
  state = {connect: false, key: null}

  handleSelectFavorite(connect, key) {
    this.setState({connect, key})
  }

  render() {
    const selectedFavorite = this.state.key && this.props.favorites.find(item => item.get('key') === this.state.key)
    return (<div className="pane-group">
      <aside className="pane pane-sm sidebar">
        <Favorite
          favorites={this.props.favorites}
          onSelect={this.handleSelectFavorite.bind(this, false)}
          onRequireConnecting={this.handleSelectFavorite.bind(this, true)}
          updateFavorite={this.props.updateFavorite}
          createFavorite={this.props.createFavorite}
          removeFavorite={this.props.removeFavorite}
          reorderFavorites={this.props.reorderFavorites}
          />
      </aside>
      <div className="pane">
        <Config
          favorite={selectedFavorite}
          connectStatus={this.props.connectStatus}
          connect={this.state.connect}
          connectToRedis={this.props.connectToRedis}
          onSave={data => {
            this.props.updateFavorite(selectedFavorite.get('key'), data)
          }}
          onDuplicate={this.props.createFavorite}
          />
      </div>
    </div>)
  }
}

function mapStateToProps(state, {instance}) {
  return {
    favorites: state.favorites,
    connectStatus: instance.get('connectStatus')
  }
}
const mapDispatchToProps = {
  updateFavorite,
  createFavorite,
  connectToRedis,
  reorderFavorites,
  removeFavorite
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectionSelector)
