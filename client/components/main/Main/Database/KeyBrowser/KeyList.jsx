'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
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

    const needRefresh = nextProps.db !== this.props.db ||
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

  handleSelect(index) {
    const item = this.state.keys[index];
    if (item && item[0]) {
      this.index = index;
      this.setState({ selectedKey: item[0] });
      this.props.onSelect(item[0]);
    }
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this.refs.table)).on('keydown', (e) => {
      console.log(e.keyCode);
      if (typeof this.index === 'number') {
        if (e.keyCode === 38 || e.keyCode === 75) {
          this.handleSelect(this.index - 1);
          return false;
        }
        if (e.keyCode === 40 || e.keyCode === 74) {
          this.handleSelect(this.index + 1);
          return false;
        }
        if (e.keyCode === 13) {
          this.setState({ editableKey: this.state.keys[this.index][0]});
          return false;
        }
      }
      if (!e.ctrlKey && e.metaKey) {
        const code = e.keyCode;
        console.log(code);
      }
      return false;
    });
    this.scan();
    $.contextMenu({
      selector: '.pattern-table',
      trigger: 'none',
      callback: (key, opt) => {
        const m = 'clicked: ' + key;
        alert(m);
      },
      items: {
        rename: { name: 'Rename' },
        delete: { name: 'Delete' },
        sep1: '---------'
      }
    });
  }

  showContextMenu(e) {
    $('.pattern-table').contextMenu();
  }

  render() {
    return <div
      ref="table"
      tabIndex="1"
      className="pattern-table"
      onContextMenu={this.showContextMenu.bind(this)}
    >
      <Table
        rowHeight={24}
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
        onRowContextMenu={this.showContextMenu.bind(this)}
        onRowClick={(evt, index) => this.handleSelect(index) }
        width={this.props.width}
        height={this.props.height}
        headerHeight={24}
        >
        <Column
          header="type"
          width={40}
          cell = { ({ rowIndex }) => {
            const cellData = this.state.keys[rowIndex][1];
            if (!cellData) {
              return '';
            }
            const type = cellData === 'string' ? 'str' : cellData;
            return <span className={`key-type ${type}`}>{type}</span>;
          } }
        />
        <Column
          header="name"
          width={this.props.width - 40}
          cell = { ({ rowIndex }) => {
            const cellData = this.state.keys[rowIndex][0];
            if (!cellData) {
              if (this.state.scanning) {
                return <span style={ { color: '#ccc' }}>Scanning...(cursor {this.state.cursor})</span>;
              }
              return <a href="#" onClick={(evt) => {
                evt.preventDefault();
                this.scan();
              }}>Scan more</a>;
            }
            return <div className="overflow-wrapper">
              <span contentEditable={cellData === this.state.editableKey}>{cellData}</span>
            </div>;
          } }
        />
      </Table>
    </div>;
  }
}

export default KeyList;
