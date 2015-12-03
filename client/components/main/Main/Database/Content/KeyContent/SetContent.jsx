'use strict';

import React from 'react';
import BaseContent from './BaseContent';
import SplitPane from 'react-split-pane';
import { Table, Column } from 'fixed-data-table-contextmenu';
import Editor from './Editor';
import AddButton from '../../../../../common/AddButton';
import ReactDOM from 'react-dom';

require('./BaseContent.scss');

class SetContent extends BaseContent {
  save(value, callback) {
    if (typeof this.state.selectedIndex === 'number') {
      const oldValue = this.state.members[this.state.selectedIndex];
      this.state.members[this.state.selectedIndex] = value.toString();
      this.setState({ members: this.state.members });
      this.props.redis.multi().srem(this.state.keyName, oldValue).sadd(this.state.keyName, value).exec((err, res) => {
        this.props.onKeyContentChange();
        callback(err, res);
      });
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
        if (typeof this.state.selectedIndex !== 'number' && this.state.members.length) {
          this.handleSelect(null, 0);
        }
        this.loading = false;
        if (this.state.members.length - 1 < this.maxRow && Number(cursor)) {
          this.load();
        }
      });
    });
  }

  handleSelect(evt, selectedIndex) {
    const content = this.state.members[selectedIndex];
    if (typeof content !== 'undefined') {
      this.setState({ selectedIndex, content });
    }
  }

  handleKeyDown(e) {
    if (typeof this.state.selectedIndex === 'number') {
      if (e.keyCode === 8) {
        this.deleteSelectedMember();
        return false;
      }
      if (e.keyCode === 38) {
        if (this.state.selectedIndex > 0) {
          this.handleSelect(null, this.state.selectedIndex - 1);
        }
        return false;
      }
      if (e.keyCode === 40) {
        if (this.state.selectedIndex < this.state.members.length - 1) {
          this.handleSelect(null, this.state.selectedIndex + 1);
        }
        return false;
      }
    }
  }

  deleteSelectedMember() {
    if (typeof this.state.selectedIndex !== 'number') {
      return;
    }
    showModal({
      title: 'Delete selected item?',
      button: 'Delete',
      content: 'Are you sure you want to delete the selected item? This action cannot be undone.'
    }).then(() => {
      const members = this.state.members;
      const deleted = members.splice(this.state.selectedIndex, 1);
      if (deleted.length) {
        this.props.redis.srem(this.state.keyName, deleted);
        if (this.state.selectedIndex >= members.length - 1) {
          this.state.selectedIndex -= 1;
        }
        this.setState({ members, length: this.state.length - 1 }, () => {
          this.props.onKeyContentChange();
          this.handleSelect(null, this.state.selectedIndex);
        });
      }
    });
  }

  componentDidMount() {
    super.componentDidMount();
    $.contextMenu({
      context: ReactDOM.findDOMNode(this.refs.table),
      selector: '.' + this.randomClass,
      trigger: 'none',
      zIndex: 99999,
      callback: (key, opt) => {
        setTimeout(() => {
          if (key === 'delete') {
            this.deleteSelectedMember();
          }
        }, 0);
        ReactDOM.findDOMNode(this.refs.table).focus();
      },
      items: {
        delete: { name: 'Delete' }
      }
    });
  }

  showContextMenu(e, row) {
    this.handleSelect(null, row);
    $(ReactDOM.findDOMNode(this.refs.table)).contextMenu({
      x: e.pageX,
      y: e.pageY,
      zIndex: 99999
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
      <div
        onKeyDown={this.handleKeyDown.bind(this)}
        tabIndex="0"
        ref="table"
        className={'base-content ' + this.randomClass}
      >
        <Table
          rowHeight={24}
          rowsCount={this.state.length}
          rowClassNameGetter={this.rowClassGetter.bind(this)}
          onRowContextMenu={this.showContextMenu.bind(this)}
          onRowClick={this.handleSelect.bind(this)}
          width={this.state.sidebarWidth}
          height={this.props.height}
          headerHeight={24}
          >
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
                      }
                    }
                  }
                }).then(res => {
                  const data = res['Value:'];
                  return this.props.redis.sismember(this.state.keyName, data).then(exists => {
                    if (exists) {
                      const error = 'Member already exists';
                      alert(error);
                      throw new Error(error);
                    }
                    return data;
                  });
                }).then(data => {
                  this.props.redis.sadd(this.state.keyName, data).then(() => {
                    this.state.members.push(data)
                    this.setState({
                      members: this.state.members,
                      length: this.state.length + 1,
                    }, () => {
                      this.props.onKeyContentChange();
                      this.handleSelect(null, this.state.members.length - 1);
                    });
                  });
                });
              }} />
            }
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
