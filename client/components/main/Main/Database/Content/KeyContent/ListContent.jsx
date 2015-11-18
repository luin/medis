'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import SplitPane from 'react-split-pane';
import { Table, Column } from 'fixed-data-table';
import Editor from './Editor';
import SortHeaderCell from './SortHeaderCell';

require('./ListContent.scss');

class ListContent extends BaseContent {
  constructor() {
    super();
    this.state.indexWidth = 60;
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

  load(index) {
    if (!super.load(index)) {
      return;
    }
    const from = this.state.members.length;
    const to = Math.min(from === 0 ? 200 : from + 1000, this.state.length - 1 - from);

    this.props.redis.lrange(this.state.keyName, from, to, (_, results) => {
      const diff = to - from + 1 - results.length;
      this.setState({
        members: this.state.members.concat(results),
        length: this.state.length - diff
      });
      if (this.state.members.length - 1 < this.maxRow && !diff) {
        this.load();
      }
    });
  }

  handleOrderChange(desc) {
    this.setState({ desc });
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
              const content = this.state.members[selectIndex];
              if (content) {
                this.setState({ selectIndex, content });
              }
            }}
            isColumnResizing={false}
            onColumnResizeEndCallback={ indexWidth => {
              this.setState({ indexWidth });
            }}
            width={this.state.sidebarWidth}
            height={this.props.height + 1}
            headerHeight={24}
            >
            <Column
              header={
                <SortHeaderCell onOrderChange={this.handleOrderChange.bind(this)} desc={this.state.desc} title="index" />
              }
              width={this.state.indexWidth}
              isResizable={true}
              cell={ ({ rowIndex }) => {
                return <div className="index-label">{ this.state.desc ? this.state.length - 1 - rowIndex : rowIndex }</div>;
              } }
            />
            <Column
              header="item"
              width={this.state.sidebarWidth - this.state.indexWidth}
              cell={ ({ rowIndex }) => {
                const data = this.state.members[this.state.desc ? this.state.length - 1 - rowIndex : rowIndex];
                if (!data) {
                  this.load(rowIndex);
                  return 'Loading...';
                }
                return <div className="overflow-wrapper"><span>{ data }</span></div>;
              } }
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
