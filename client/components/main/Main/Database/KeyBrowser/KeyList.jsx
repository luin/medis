'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Column } from 'fixed-data-table-contextmenu';
import ContentEditable from '../../../../common/ContentEditable';
import _ from 'lodash';
import { clipboard } from 'electron';
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
    this.randomClass = 'pattern-table-' + (Math.random() * 100000 | 0);
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
      const key = item[0];
      this.index = index;
      const editableKey = this.state.editableKey === key ? this.state.editableKey : null;
      this.setState({ selectedKey: item[0], editableKey });
      this.props.onSelect(item[0]);
    } else {
      this.setState({ selectedKey: null, editableKey: null });
    }
  }

  deleteSelectedKey() {
    showModal({
      title: 'Delete selected key?',
      button: 'Delete',
      content: 'Are you sure you want to delete the selected key? This action cannot be undone.'
    }).then(() => {
      const keys = this.state.keys;
      const deleted = keys.splice(this.index, 1);
      if (deleted.length) {
        this.props.redis.del(deleted[0][0]);
        if (this.index >= keys.length - 1) {
          this.index -= 1;
        }
        this.setState({ keys }, () => {
          this.handleSelect(this.index);
        });
      }
    }).catch(() => {});
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this)).on('keydown', (e) => {
      if (typeof this.index === 'number' && !this.state.editableKey) {
        if (e.keyCode === 8) {
          this.deleteSelectedKey();
          return false;
        }
        if (e.keyCode === 38) {
          this.handleSelect(this.index - 1);
          return false;
        }
        if (e.keyCode === 40) {
          this.handleSelect(this.index + 1);
          return false;
        }
      }
      if (!e.ctrlKey && e.metaKey) {
        const code = e.keyCode;
      }
      return true;
    });
    this.scan();
    $.contextMenu({
      context: ReactDOM.findDOMNode(this),
      selector: '.' + this.randomClass,
      trigger: 'none',
      zIndex: 99999,
      callback: (key, opt) => {
        if (key === 'delete') {
          this.deleteSelectedKey();
        } else if (key === 'rename') {
          this.setState({ editableKey: this.state.keys[this.index][0]});
        } else if (key === 'copy') {
          clipboard.writeText(this.state.keys[this.index][0]);
        }
      },
      items: {
        copy: { name: 'Copy to Clipboard'},
        sep1: '---------',
        rename: { name: 'Rename' },
        delete: { name: 'Delete' }
      }
    });
  }

  showContextMenu(e, row) {
    this.handleSelect(row);
    $(ReactDOM.findDOMNode(this)).contextMenu({
      x: e.pageX,
      y: e.pageY,
      zIndex: 99999
    });
  }

  render() {
    return <div
      tabIndex="0"
      className={'pattern-table ' + this.randomClass}
    >
      <Table
        rowHeight={24}
        rowsCount={this.state.keys.length + (this.state.cursor === '0' ? 0 : 1)}
        onScrollStart={() => {
          if (this.state.editableKey) {
            this.setState({ editableKey: null });
          }
        }}
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
        onRowDoubleClick={(evt, index) => {
          this.handleSelect(index);
          this.setState({ editableKey: this.state.keys[index][0]});
        }}
        width={this.props.width}
        height={this.props.height}
        headerHeight={24}
        >
        <Column
          header="type"
          width={40}
          cell = { ({ rowIndex }) => {
            const item = this.state.keys[rowIndex];
            if (!item) {
              return '';
            }
            const cellData = item[1];
            if (!cellData) {
              return '';
            }
            const type = cellData === 'string' ? 'str' : cellData;
            return <span className={`key-type ${type}`}>{type}</span>;
          } }
        />
        <Column
          header={<div>name2</div>}
          width={this.props.width - 40}
          cell = { ({ rowIndex }) => {
            const item = this.state.keys[rowIndex];
            let cellData;
            if (item) {
              cellData = item[0];
            }
            if (!cellData) {
              if (this.state.scanning) {
                return <span style={ { color: '#ccc' }}>Scanning...(cursor {this.state.cursor})</span>;
              }
              return <a href="#" onClick={(evt) => {
                evt.preventDefault();
                this.scan();
              }}>Scan more</a>;
            }
            return <ContentEditable
              className="ContentEditable overflow-wrapper"
              enabled={cellData === this.state.editableKey}
              onChange={newKeyName => {
                const keys = this.state.keys;
                const oldKey = keys[rowIndex][0];
                if (oldKey !== newKeyName && newKeyName) {
                  this.props.redis.exists(newKeyName).then(exists => {
                    if (exists) {
                      return showModal({
                        title: 'Overwrite the key?',
                        button: 'Overwrite',
                        content: `Key "${newKeyName}" already exists. Are you sure you want to overwrite this key?`
                      });
                    }
                  }).then(() => {
                    keys[rowIndex] = [newKeyName, keys[rowIndex][1]];
                    this.props.redis.rename(oldKey, newKeyName)
                    this.setState({ keys });
                  }).catch(() => {});
                }
                this.setState({ editableKey: null });
                ReactDOM.findDOMNode(this).focus();
              }}
              html={cellData}
            />;
          } }
        />
      </Table>
    </div>;
  }
}

export default KeyList;
