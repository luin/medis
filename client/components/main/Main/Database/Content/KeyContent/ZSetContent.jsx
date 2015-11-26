'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import SplitPane from 'react-split-pane';
import { Table, Column } from 'fixed-data-table';
import Editor from './Editor';
import SortHeaderCell from './SortHeaderCell';
import AddButton from '../../../../../common/AddButton';

require('./BaseContent.scss');

class ZSetContent extends BaseContent {
  constructor() {
    super();
    this.state.scoreWidth = 60;
  }

  save(value, callback) {
    if (typeof this.state.selectedIndex === 'number') {
      const item = this.state.members[this.state.selectedIndex];
      const oldValue = item[0];
      item[0] = value.toString();
      this.setState({ members: this.state.members });
      console.log('change', oldValue, value);
      this.props.redis.multi().zrem(this.state.keyName, oldValue).zadd(this.state.keyName, item[1], value).exec(callback);
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

    this.props.redis.zrange(this.state.keyName, from, to, 'WITHSCORES', (_, results) => {
      const items = [];
      for (let i = 0; i < results.length - 1; i += 2) {
        items.push([results[i], results[i + 1]]);
      }
      const diff = to - from + 1 - items.length;
      this.setState({
        members: this.state.members.concat(items),
        length: this.state.length - diff
      }, () => {
        console.log(this.state.members);
        this.loading = false;
        if (this.state.members.length - 1 < this.maxRow && !diff) {
          this.load();
        }
      });
    });
  }

  handleSelect(evt, selectedIndex) {
    const item = this.state.members[this.state.desc ? this.state.length - 1 - selectedIndex : selectedIndex];
    if (item) {
      this.setState({ selectedIndex, content: item[0] });
    }
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
          onRowClick={this.handleSelect.bind(this)}
          isColumnResizing={false}
          onColumnResizeEndCallback={ scoreWidth => {
            this.setState({ scoreWidth });
          }}
          width={this.state.sidebarWidth}
          height={this.props.height + 1}
          headerHeight={24}
          >
          <Column
            header={
              <SortHeaderCell
                title="score"
                onOrderChange={desc => this.setState({
                  desc,
                  selectedIndex: typeof this.state.selectedIndex === 'number' ? this.state.length - 1 - this.state.selectedIndex : null
                })}
                desc={this.state.desc}
              />
            }
            width={this.state.scoreWidth}
            isResizable={true}
            cell={ ({ rowIndex }) => {
              const member = this.state.members[this.state.desc ? this.state.length - 1 - rowIndex : rowIndex];
              if (!member) {
                return '';
              }
              return <div className="overflow-wrapper"><span>{member[1]}</span></div>;
            } }
          />
          <Column
            header={
              <AddButton title="member" onClick={() => {
                showModal({
                  button: 'Insert Member',
                  form: {
                    type: 'object',
                    properties: {
                      'Value:': {
                        type: 'string'
                      },
                      'Score:': {
                        type: 'number'
                      }
                    }
                  }
                }).then(res => {
                  const data = res['Value:'];
                  const score = res['Score:'];
                  this.props.redis.zadd(this.state.keyName, score, data).then(() => {
                    this.state.members.push([data, score])
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
            width={this.state.sidebarWidth - this.state.scoreWidth}
            cell={ ({ rowIndex }) => {
              const member = this.state.members[this.state.desc ? this.state.length - 1 - rowIndex : rowIndex];
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
          buffer={typeof this.state.content === 'string' && new Buffer(this.state.content)}
          onSave={this.save.bind(this)}
        />
      </SplitPane>;
  }
}

export default ZSetContent;
