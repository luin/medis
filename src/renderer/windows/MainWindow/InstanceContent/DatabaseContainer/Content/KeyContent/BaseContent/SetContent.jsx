'use strict'

import React from 'react'
import BaseContent from '.'
import SplitPane from 'react-split-pane'
import {Table, Column} from 'fixed-data-table-contextmenu'
import Editor from './Editor'
import AddButton from '../../../AddButton'
import {remote} from 'electron'

require('./index.scss')

class SetContent extends BaseContent {
  save(value, callback) {
    if (typeof this.state.selectedIndex === 'number') {
      const oldValue = this.state.members[this.state.selectedIndex]

      const key = this.state.keyName
      this.props.redis.sismember(key, value).then(exists => {
        if (exists) {
          callback(new Error('The value already exists in the set'))
          return
        }
        this.props.redis.multi().srem(key, oldValue).sadd(key, value).exec((err, res) => {
          if (!err) {
            this.state.members[this.state.selectedIndex] = value.toString()
            this.setState({members: this.state.members})
          }
          this.props.onKeyContentChange()
          callback(err, res)
        })
      })
    } else {
      alert('Please wait for data been loaded before saving.')
    }
  }

  load(index) {
    if (!super.load(index)) {
      return
    }
    const count = Number(this.cursor) ? 10000 : 500
    this.props.redis.sscan(this.state.keyName, this.cursor, 'COUNT', count, (_, [cursor, results]) => {
      this.cursor = cursor
      const length = Number(cursor) ? this.state.length : this.state.members.length + results.length

      this.setState({
        members: this.state.members.concat(results),
        length
      }, () => {
        if (typeof this.state.selectedIndex !== 'number' && this.state.members.length) {
          this.handleSelect(null, 0)
        }
        this.loading = false
        if (this.state.members.length - 1 < this.maxRow && Number(cursor)) {
          this.load()
        }
      })
    })
  }

  handleSelect(evt, selectedIndex) {
    const content = this.state.members[selectedIndex]
    if (typeof content !== 'undefined') {
      this.setState({selectedIndex, content})
    }
  }

  handleKeyDown(e) {
    if (typeof this.state.selectedIndex === 'number') {
      if (e.keyCode === 8) {
        this.deleteSelectedMember()
        return false
      }
      if (e.keyCode === 38) {
        if (this.state.selectedIndex > 0) {
          this.handleSelect(null, this.state.selectedIndex - 1)
        }
        return false
      }
      if (e.keyCode === 40) {
        if (this.state.selectedIndex < this.state.members.length - 1) {
          this.handleSelect(null, this.state.selectedIndex + 1)
        }
        return false
      }
    }
  }

  deleteSelectedMember() {
    if (typeof this.state.selectedIndex !== 'number') {
      return
    }
    showModal({
      title: 'Delete selected item?',
      button: 'Delete',
      content: 'Are you sure you want to delete the selected item? This action cannot be undone.'
    }).then(() => {
      const members = this.state.members
      const deleted = members.splice(this.state.selectedIndex, 1)
      if (deleted.length) {
        this.props.redis.srem(this.state.keyName, deleted)
        if (this.state.selectedIndex >= members.length - 1) {
          this.state.selectedIndex -= 1
        }
        this.setState({members, length: this.state.length - 1}, () => {
          this.props.onKeyContentChange()
          this.handleSelect(null, this.state.selectedIndex)
        })
      }
    })
  }

  showContextMenu(e, row) {
    this.handleSelect(null, row)

    const menu = remote.Menu.buildFromTemplate([
      {
        label: 'Delete',
        click: () => {
          this.deleteSelectedMember()
        }
      }
    ])
    menu.popup(remote.getCurrentWindow())
  }

  render() {
    return (<SplitPane
      className="pane-group"
      minSize={80}
      split="vertical"
      ref="node"
      defaultSize={this.props.contentBarWidth}
      onChange={this.props.setSize.bind(null, 'content')}
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
          width={this.props.contentBarWidth}
          height={this.props.height}
          headerHeight={24}
          >
          <Column
            width={this.props.contentBarWidth}
            cell={({rowIndex}) => {
              const member = this.state.members[rowIndex]
              if (typeof member === 'undefined') {
                this.load(rowIndex)
                return 'Loading...'
              }
              return <div className="overflow-wrapper"><span>{member}</span></div>
            }}
            header={
              <AddButton
                title="member" onClick={() => {
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
                    const data = res['Value:']
                    return this.props.redis.sismember(this.state.keyName, data).then(exists => {
                      if (exists) {
                        const error = 'Member already exists'
                        alert(error)
                        throw new Error(error)
                      }
                      return data
                    })
                  }).then(data => {
                    this.props.redis.sadd(this.state.keyName, data).then(() => {
                      this.state.members.push(data)
                      this.setState({
                        members: this.state.members,
                        length: this.state.length + 1
                      }, () => {
                        this.props.onKeyContentChange()
                        this.handleSelect(null, this.state.members.length - 1)
                      })
                    })
                  })
                }}
                               />
            }
          />
        </Table>
      </div>
      <Editor
        buffer={typeof this.state.content === 'string' && Buffer.from(this.state.content)}
        onSave={this.save.bind(this)}
        />
    </SplitPane>)
  }
}

export default SetContent
