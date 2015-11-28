'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import SplitPane from 'react-split-pane';
import { Table, Column } from 'fixed-data-table';
import Editor from './Editor';
import AddButton from '../../../../../common/AddButton';

class HashContent extends BaseContent {
  save(value, callback) {
    if (typeof this.state.selectedIndex === 'number') {
      const [key] = this.state.members[this.state.selectedIndex];
      this.state.members[this.state.selectedIndex][1] = new Buffer(value);
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

  handleSelect(evt, selectedIndex) {
    const item = this.state.members[selectedIndex];
    console.log('want set');
    if (item) {
      console.log('set', item);
      this.setState({ selectedIndex, content: item[1] });
    }
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
          onRowClick={this.handleSelect.bind(this)}
          width={this.state.sidebarWidth}
          height={this.props.height + 1}
          headerHeight={24}
          >
          <Column
            header={
              <AddButton title="key" onClick={() => {
                showModal({
                  button: 'Insert Member',
                  form: {
                    type: 'object',
                    properties: {
                      'Key:': {
                        type: 'string'
                      }
                    }
                  }
                }).then(res => {
                  const data = res['Key:'];
                  const value = 'New Member';
                  this.props.redis.hset(this.state.keyName, data, value).then(() => {
                    this.state.members.push([data, new Buffer(value)])
                    this.setState({
                      members: this.state.members,
                      length: this.state.length + 1,
                    }, () => {
                      this.handleSelect(null, this.state.members.length - 1);
                    });
                  });
                });
              }} />
            }
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
          buffer={this.state.content}
          onSave={this.save.bind(this)}
        />
      </SplitPane>;
  }
}

export default HashContent;
