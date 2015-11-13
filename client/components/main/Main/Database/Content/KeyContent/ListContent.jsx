'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import { Table, Column } from 'fixed-data-table';
import Editor from './Editor';

class ListContent extends BaseContent {
  constructor() {
    super();
    this.state = { keyName: null, length: 0 };
  }

  init(keyName) {
    this.setState({ keyName: null, content: null });
    this.props.redis.llen(keyName, (err, length) => {
      this.setState({ keyName, length });
    });
  }

  save(value, callback) {
    if (this.state.keyName) {
      this.props.redis.set(this.state.keyName, value, callback);
    } else {
      alert('Please wait for data been loaded before saving.');
    }
  }

  render() {
    return <SplitPane
      className="pane-group"
      minSize="250"
      split="vertical"
      defaultSize={300}
      ref="node"
      onChange={size => {
        this.setState({ sidebarWidth: size });
      }}
    >
      <Table
        rowHeight={24}
        rowGetter={this.getRow.bind(this)}
        rowsCount={this.state.length}
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
          label="members"
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
      <Editor style={{ height: this.props.height }}
        content={this.state.content}
        onSave={this.save.bind(this)}
      />
    </SplitPane>;
  }
}

export default ListContent;

function tryFormatJSON(jsonString) {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === "object" && o !== null) {
      return JSON.stringify(o, null, '\t');
    }
  }
  catch (e) { }

  return false;
}
