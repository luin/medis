'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import SplitPane from 'react-split-pane';
import { Table, Column } from 'fixed-data-table';
import Editor from './Editor';

require('./ListContent.scss');

class ListContent extends BaseContent {
  constructor() {
    super();
    this.state = {
      keyName: null,
      length: 0,
      sidebarWidth: 200,
      members: []
    };
  }

  init(keyName) {
    this.setState({ keyName: null, content: null });
    this.props.redis.llen(keyName, (_, length) => {
      this.setState({ keyName, length });
    });
  }

  save(value, callback) {
    if (typeof this.state.selectIndex === 'number') {
      this.state.members[this.state.selectIndex] = value.toString();
      this.setState({ members: this.state.members });
      this.props.redis.lset(this.state.keyName, this.state.selectIndex, value, callback);
    } else {
      alert('Please wait for data been loaded before saving.');
    }
  }

  load(from, length) {
    const to = from + length - 1;
    const members = this.state.members;
    for (let i = from; i <= to; i++) {
      members[i] = null;
    }
    this.props.redis.lrange(this.state.keyName, from, to, (_, results) => {
      const members = this.state.members;
      for (let i = from; i <= to; i++) {
        members[i] = results[i - from];
      }
      this.setState({ members });
    });
  }

  getRow(index) {
    if (typeof this.state.members[index] === 'undefined') {
      this.load(Math.floor(index / 100) * 100, 100);
    }
    return [this.state.members[index]];
  }

  render() {
    return <div className="ListContent">
      <SplitPane
        className="pane-group"
        minSize="80"
        split="vertical"
        defaultSize={200}
        ref="node"
        onChange={size => {
          this.setState({ sidebarWidth: size });
        }}
        >
        <div style={ { 'marginTop': -1 } }>
          <Table
            rowHeight={24}
            rowGetter={this.getRow.bind(this)}
            rowsCount={this.state.length}
            rowClassNameGetter={
              index => {
                const item = this.state.members[index];
                if (!item) {
                  return 'type-list is-loading';
                }
                if (index === this.state.selectIndex) {
                  return 'type-list is-selected';
                }
                return 'type-list';
              }
            }
            onRowClick={(evt, index) => {
              const item = this.state.members[index];
              if (item && item[0]) {
                this.setState({ selectIndex: index, content: item });
              }
            }}
            width={this.state.sidebarWidth}
            height={this.props.height + 1}
            headerHeight={24}
            >
            <Column
              label="members"
              width={this.state.sidebarWidth}
              dataKey={0}
              cellRenderer={
                (cellData, cellDataKey, rowData, rowIndex) => {
                  if (cellData === null) {
                    cellData = 'Loading...';
                  }
                  return <div style={ { width: this.state.sidebarWidth, display: 'flex' } }><div className="index-label">{rowIndex}</div><div className="list-preview">{cellData}</div></div>;
                }
              }
            />
          </Table>
          </div>
          <Editor
            style={{ height: this.props.height }}
            buffer={this.state.content && new Buffer(this.state.content)}
            onSave={this.save.bind(this)}
          />
        </SplitPane>
      </div>;
  }
}

export default ListContent;
