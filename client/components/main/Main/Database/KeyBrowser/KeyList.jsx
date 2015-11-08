'use strict';

import React from 'react';
import { Table, Column } from 'fixed-data-table';
import _ from 'lodash';
require('./KeyList.scss');

class KeyList extends React.Component {
  constructor() {
    super();
    this.state = {
      keys: [],
      selectedKey: null,
      sidebarWidth: 300,
      cursor: '0'
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.db !== this.props.db) {
      this.props.redis.select(nextProps.db);
    }

    var needRefresh = nextProps.db !== this.props.db ||
      nextProps.pattern !== this.props.pattern ||
      nextProps.redis !== this.props.redis;

    if (needRefresh) {
      this.setState({
        cursor: '0',
        keys: []
      }, () => {
        this.scan();
      });
    }
  }

  scan() {
    if (this.scanning) {
      return;
    }
    this.scanning = true;
    this.setState({ scanning: true });

    const redis = this.props.redis;

    const targetPattern = this.props.pattern;
    let pattern = targetPattern;
    if (pattern.indexOf('*') === -1 && pattern.indexOf('?') === -1) {
      pattern += '*';
    }

    let count = 0;
    let cursor = this.state.cursor;

    let filterKey;

    // Plain key
    if (targetPattern !== pattern) {
      redis.type(targetPattern, (err, type) => {
        if (type !== 'none') {
          filterKey = targetPattern;
          this.setState({
            keys: this.state.keys.concat([[targetPattern, type]])
          });
        }
        iter.call(this, 400, 1);
      });
    } else {
      iter.call(this, 400, 1);
    }

    function iter(fetchCount, times) {
      redis.scan(cursor, 'MATCH', pattern, 'COUNT', fetchCount, (err, res) => {
        if (this.props.pattern !== targetPattern) {
          this.scanning = false;
          setTimeout(this.scan.bind(this), 0);
          return;
        }
        const newCursor = res[0];
        let fetchedKeys = res[1];
        let promise;
        if (fetchedKeys.length) {
          if (filterKey) {
            fetchedKeys = fetchedKeys.filter(key => key !== filterKey);
          }
          count += fetchedKeys.length;
          const pipeline = redis.pipeline();
          fetchedKeys.forEach(key => pipeline.type(key));
          promise = pipeline.exec();
        } else {
          promise = Promise.resolve([]);
        }
        promise.then(types => {
          if (this.props.pattern !== targetPattern) {
            this.scanning = false;
            setTimeout(this.scan.bind(this), 0);
            return;
          }
          const keys = _.zip(fetchedKeys, types.map(res => res[1]));

          let needContinue = true;
          if (Number(newCursor) === 0) {
            needContinue = false;
          } else if (count >= 100) {
            needContinue = false;
          } else if (count > 0 && times > 200) {
            needContinue = false;
          }
          cursor = newCursor;

          if (needContinue) {
            this.setState({
              cursor,
              keys: this.state.keys.concat(keys)
            }, () => {
              iter.call(this, count < 10 ? 5000 : (count < 50 ? 2000 : 1000), times + 1);
            });
          } else {
            this.setState({
              cursor,
              scanning: false,
              keys: this.state.keys.concat(keys)
            }, () => this.scanning = false);
          }
        });
      });
    }
  }

  componentDidMount() {
    this.scan();
  }

  getRow(index) {
    return this.state.keys[index] || [];
  }

  render() {
    return <div className="pattern-table">
      <Table
        rowHeight={24}
        rowGetter={this.getRow.bind(this)}
        rowsCount={this.state.keys.length + (this.state.cursor === '0' ? 0 : 1)}
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
                if (this.state.scanning) {
                  return <span style={ { color: '#ccc' }}>Scanning...(cursor {this.state.cursor})</span>;
                }
                return <a href="#" onClick={(evt) => {
                  evt.preventDefault();
                  this.scan();
                }}>Scan more</a>;
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
