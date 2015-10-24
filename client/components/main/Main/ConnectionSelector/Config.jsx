'use strict';

import React from 'react';
import store from '../../../../store';
import actions from '../../../../actions';

class Config extends React.Component {
  constructor() {
    super();
    this.state = {
      favorite: null,
      selectedTab: 'standard'
    };
  }

  handleSelectFavorite(favorite) {
    this.setState({ favorite });
  }

  getProp(property) {
    return this.props.favorite ? this.props.favorite.get(property) : '';
  }

  render() {
    return <div>
      <form onSubmit={
        (evt) => {
          evt.preventDefault();
          store.dispatch(actions('connect'));
        }
      } className="nt-form" style={ { width: 500, margin: '60px auto 0' } }>
        <div className="nt-form__row" style={ { display: this.props.favorite ? 'block' : 'none' } }>
          <label htmlFor="name">Name</label>
          <input type="text" id="name" value={this.getProp('name')} placeholder="Bookmark name" />
        </div>
        <div className="nt-form__row">
          <label htmlFor="host">Redis Host</label>
          <input type="text" id="host" value={this.getProp('host')} placeholder="localhost" />
        </div>
        <div className="nt-form__row">
          <label htmlFor="port">Port</label>
          <input type="text" id="port" value={this.getProp('port')} placeholder="6379" />
        </div>
        <div className="nt-form__row">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={this.getProp('password')} />
        </div>
        <div className="nt-form__row">
          <label htmlFor="ssh">SSH Tunnel</label>
          <input type="checkbox" id="ssh" value={this.getProp('ssh')} />
        </div>
        <button onPress={() => {
        }}>Save Changes</button>
        <button onPress="submit" color="blue">Save and Connect</button>
      </form>
    </div>;
  }
}

export default Config;
