'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import SplitPane from 'react-split-pane';
import { Table, Column } from 'fixed-data-table';
import Editor from './Editor';

require('./BaseContent.scss');

class SetContent extends BaseContent {
  save(value, callback) {
    if (typeof this.state.selectedIndex === 'number') {
      const oldValue = this.state.members[this.state.selectedIndex];
      this.state.members[this.state.selectedIndex] = value.toString();
      this.setState({ members: this.state.members });
      this.props.redis.multi().srem(this.state.keyName, oldValue).sadd(this.state.keyName, value).exec(callback);
    } else {
      alert('Please wait for data been loaded before saving.');
    }
  }

  load(index) {
    if (!super.load(index)) {
      return;
    }
    const count = Number(this.cursor) ? 10000 : 500;
    this.props.redis.sscan(this.state.keyName, this.cursor, 'COUNT', count, (_, [cursor, results]) => {
      this.cursor = cursor;
      const length = Number(cursor) ? this.state.length : this.state.members.length + results.length;

      this.setState({
        members: this.state.members.concat(results),
        length
      }, () => {
        this.loading = false;
        if (this.state.members.length - 1 < this.maxRow && Number(cursor)) {
          this.load();
        }
      });
    });
  }

  render() {
    return <SplitPane
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
          rowClassNameGetter={this.rowClassGetter.bind(this)}
          onRowClick={(evt, selectedIndex) => {
            const content = this.state.members[selectedIndex];
            if (typeof content !== 'undefined') {
              this.setState({ selectedIndex, content });
            }
          }}
          width={this.state.sidebarWidth}
          height={this.props.height + 1}
          headerHeight={24}
          >
          <Column
            header="member"
            width={this.state.sidebarWidth}
            cell={ ({ rowIndex }) => {
              const member = this.state.members[rowIndex];
              if (typeof member === 'undefined') {
                this.load(rowIndex);
                return 'Loading...';
              }
              return <div className="overflow-wrapper"><span>{member}</span></div>;
            } }
          />
        </Table>
        </div>
        <Editor
          style={{ height: this.props.height }}
          buffer={typeof this.state.content === 'string' && new Buffer(this.state.content)}
          onSave={this.save.bind(this)}
        />
      </SplitPane>;
  }
}

export default SetContent;
