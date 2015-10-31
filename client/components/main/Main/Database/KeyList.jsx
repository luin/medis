'use strict';

import React from 'react';
import { Table, Column } from 'fixed-data-table';
require('./KeyList.scss');

class KeyList extends React.Component {
  constructor() {
    super();
    this.state = {
      keys: [],
      selectedKey: null,
      sidebarWidth: 300,
      cursor: 0
    };
  }

  componentWillReceiveProps() {
    this.setState({
      cursor: 0
    });
  }

  componentDidMount() {
    const redis = this.props.redis;

    redis.scan('0', 'MATCH', this.props.pattern, 'COUNT', '500', (_, res) => {
      console.log(res);
      Promise.all(res[1].map(key => {
        return Promise.all([key, redis.type(key)]);
      })).then(keys => {
        this.setState({
          keys
        });
      });
    });
  }

  handleSelectPattern() {
  }

  getRow(index) {
    return this.state.keys[index] || [];
  }

  render() {
    return <div className="pattern-table">
      <Table
        rowHeight={24}
        rowGetter={this.getRow.bind(this)}
        rowsCount={this.state.keys.length + 1}
        rowClassNameGetter={index => {
          const item = this.state.keys[index];
          if (!item) {
            return 'is-loading';
          }
          if (item[0] === this.state.selectedKey) {
            return 'is-selected';
          }
          return '';
        }}
        onRowClick={(evt, index) => {
          const item = this.state.keys[index];
          if (item && item[0]) {
            this.setState({ selectedKey: item[0] });
            this.props.onSelect(item[0]);
          }
        }}
        width={this.props.width}
        height={this.props.height}
        headerHeight={24}
        >
        <Column
          label="type"
          width={40}
          dataKey={1}
          cellRenderer={
            cellData => {
              if (!cellData) {
                return '';
              }
              const type = cellData === 'string' ? 'str' : cellData;
              return <span className={`key-type ${type}`}>{type}</span>;
            }
          }
        />
        <Column
          label="name"
          width={this.props.width - 40}
          dataKey={0}
          cellRenderer={
            cellData => {
              if (!cellData) {
                return 'Scanning...';
              }
              return cellData;
            }
          }
        />
      </Table>
    </div>;
  }
}

export default KeyList;
