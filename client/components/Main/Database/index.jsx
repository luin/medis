'use strict';

import React from 'react';
import store from '../../../store';
import action from '../../../actions';
// import KeySelector from './KeySelector';
import { Table, Column } from 'fixed-data-table';

class Database extends React.Component {
  constructor() {
    super();
    this.state = { keys: [], sidebarWidth: 400 };
  }

  componentDidMount() {
    const redis = this.props.redis;
    console.log(redis);

    redis.scan('0', 'MATCH', 'fh:*', 'COUNT', '200', (err, res) => {
      console.log(err, res);
      Promise.all(res[1].map(key => {
        return Promise.all([key, redis.type(key)]);
      })).then(keys => {
        console.log(keys);
        this.setState({
          keys
        });
      });
    });
  }

  handleSelectPattern() {
    console.log(arguments);
  }

  render() {
    function rowGetter(rowIndex) {
      return this.state.keys[rowIndex];
    }
    return <div className="pane-group">
      <div className="pane sidebar" style={ { flex: 'none', width: this.state.sidebarWidth } }>
        <div className="pattern-input">
          <span className="icon icon-search"></span>
          <input type="search" className="form-control" placeholder="Key name or patterns" />
        </div>
        <div className="pattern-table">
          <Table
            rowHeight={30}
            rowGetter={rowGetter.bind(this)}
            rowsCount={this.state.keys.length}
            width={this.state.sidebarWidth}
            height={500}
            headerHeight={30}>
            <Column
              label="name"
              width={300}
              dataKey={0}
              isResizable={true}
            />
            <Column
              label="type"
              width={100}
              dataKey={1}
              isResizable={true}
            />
          </Table>
        </div>
      </div>
      <div className="pane ">
      </div>
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
