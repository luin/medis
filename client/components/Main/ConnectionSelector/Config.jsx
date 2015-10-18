'use strict';

import React from 'react';
import store from '../../../store';
import actions from '../../../actions';

class Config extends React.Component {
  constructor() {
    super();
    this.state = {
      favorite: null
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
      <p>{this.getProp('key')}</p>
      <button onClick={() =>
        store.dispatch(actions('connect'))
      }>Connect</button>
    </div>;
  }
}

export default Config;
