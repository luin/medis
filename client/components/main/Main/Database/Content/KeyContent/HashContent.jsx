'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import SplitPane from 'react-split-pane';
import { Table, Column } from 'fixed-data-table';
import Editor from './Editor';

class HashContent extends BaseContent {
  save(value, callback) {
    if (typeof this.state.selectedIndex === 'number') {
      const [key] = this.state.members[this.state.selectedIndex];
      this.state.members[this.state.selectedIndex][1] = value;
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
    return <SplitPane
      className="pane-group"
      minSize="80"
      split="vertical"
      defaultSize={200}
      onChange={size => {
        this.setState({ sidebarWidth: size });
      }}
      >
      <div style={ { 'marginTop': -1 } }>
        <Table
          rowHeight={24}
          rowsCount={this.state.length}
          rowClassNameGetter={this.rowClassGetter.bind(this)}
          onRowClick={(evt, selectedIndex) => {
            const item = this.state.members[selectedIndex];
            if (item) {
              this.setState({ selectedIndex, content: item[1] });
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
              const member = this.state.members[rowIndex];
              if (!member) {
                this.load(rowIndex);
                return 'Loading...';
              }
              return <div className="overflow-wrapper"><span>{member[0]}</span></div>;
            } }
          />
        </Table>
        </div>
        <Editor
          style={{ height: this.props.height }}
          buffer={this.state.content && this.state.content}
          onSave={this.save.bind(this)}
        />
      </SplitPane>;
  }
}

export default HashContent;
