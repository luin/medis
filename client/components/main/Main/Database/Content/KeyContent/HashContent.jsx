'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import SplitPane from 'react-split-pane';
import { Table, Column } from 'fixed-data-table';
import Editor from './Editor';

require('./ListContent.scss');

class HashContent extends BaseContent {
  save(value, callback) {
    if (typeof this.state.selectIndex === 'number') {
      const [key] = this.state.members[this.state.selectIndex];
      this.state.members[this.state.selectIndex][1] = value;
      this.setState({ members: this.state.members });
      this.props.redis.hset(this.state.keyName, key, value, callback);
    } else {
      alert('Please wait for data been loaded before saving.');
    }
  }

  load(index) {
    if (index > this.maxRow) {
      this.maxRow = index;
    }
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    const count = Number(this.cursor) ? 10000 : 500;
    this.props.redis.hscanBuffer(this.state.keyName, this.cursor, 'MATCH', '*', 'COUNT', count, (_, [cursor, result]) => {
      this.isLoading = false;
      for (let i = 0; i < result.length - 1; i += 2) {
        this.state.members.push([result[i].toString(), result[i + 1]]);
      }
      this.cursor = cursor;
      this.setState({ members: this.state.members });
      if (this.state.members.length - 1 < this.maxRow && Number(cursor)) {
        this.load();
      }
    });
  }

  render() {
    return <div className="HashContent">
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
            onRowClick={(evt, selectIndex) => {
              const item = this.state.members[selectIndex];
              if (item && item[0]) {
                this.setState({ selectIndex, content: item[1] });
              }
            }}
            width={this.state.sidebarWidth}
            height={this.props.height + 1}
            headerHeight={24}
            >
            <Column
              header="key"
              width={this.state.sidebarWidth}
              cell={ ({ rowIndex }) => {
                if (!this.state.members[rowIndex]) {
                  this.load(rowIndex);
                  return 'Loading...';
                }
                const cellData = this.state.members[rowIndex][0];
                return <div style={ { width: this.state.sidebarWidth, display: 'flex' } }><div className="list-preview">{cellData}</div></div>;
              } }
            />
          </Table>
          </div>
          <Editor
            style={{ height: this.props.height }}
            buffer={this.state.content && this.state.content}
            onSave={this.save.bind(this)}
          />
        </SplitPane>
      </div>;
  }
}

export default HashContent;
