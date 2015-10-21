'use strict';

import React from 'react';
import store from '../../../store';
import action from '../../../actions';
import KeySelector from './KeySelector';

class Database extends React.Component {
  constructor() {
    super();
    this.state = { keys: [] };
  }

  componentDidMount() {
    const redis = this.props.redis;
    console.log(redis);

    redis.scan('0', 'MATCH', 'fh:*', 'COUNT', '50', (err, res) => {
      console.log(err, res);
      this.setState({
        keys: res[1]
      });
    });
  }

  handleSelectPattern() {
    console.log(arguments);
  }

  render() {
    return <div className="pane-group">
      <aside className="pane pane-sm sidebar">
        <KeySelector
          patterns={this.props.patterns}
          connectionKey={this.props.connectionKey}
          onSelect={this.handleSelectPattern.bind(this)}
        />
      </aside>
      <aside className="pane pane-sm sidebar">
        {
          this.state.keys.map(key => {
            return <p>{key}</p>;
          })
        }
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

export default Database;
