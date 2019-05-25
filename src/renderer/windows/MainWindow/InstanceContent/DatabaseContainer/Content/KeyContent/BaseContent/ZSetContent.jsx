'use strict'

import React from 'react'
import BaseContent from '.'
import SplitPane from 'react-split-pane'
import {Table, Column} from 'fixed-data-table-contextmenu'
import Editor from './Editor'
import SortHeaderCell from './SortHeaderCell'
import AddButton from '../../../AddButton'
import ContentEditable from '../../../ContentEditable'
import ReactDOM from 'react-dom'
import {clipboard, remote} from 'electron'
import sortedIndexBy from 'lodash.sortedindexby'

require('./index.scss')

class ZSetContent extends BaseContent {
  save(value, callback) {
    const {selectedIndex, members, keyName} = this.state
    if (typeof selectedIndex === 'number') {
      const item = members[selectedIndex]
      const oldValue = item[0]
      item[0] = value.toString()
      this.setState({members})
      this.props.redis.multi()
        .zrem(keyName, oldValue)
        .zadd(keyName, item[1], value)
        .exec((err, res) => {
          this.props.onKeyContentChange()
          callback(err, res)
        })
    } else {
      alert('Please wait for data been loaded before saving.')
    }
  }

  load(index) {
    if (!super.load(index)) {
      return
    }
    const {members, desc, length, keyName} = this.state
    const from = members.length
    const to = Math.min(from === 0 ? 200 : from + 1000, length - 1)

    const commandName = desc ? 'zrevrange' : 'zrange'
    this.props.redis[commandName](keyName, from, to, 'WITHSCORES', (_, results) => {
      if (this.state.desc !== desc || this.state.members.length !== from) {
        this.loading = false
        return
      }
      const items = []
      for (let i = 0; i < results.length - 1; i += 2) {
        items.push([results[i], results[i + 1]])
      }
      const diff = to - from + 1 - items.length
      this.setState({
        members: members.concat(items),
        length: length - diff
      }, () => {
        const currentMembers = this.state.members
        if (typeof this.state.selectedIndex !== 'number' && currentMembers.length) {
          this.handleSelect(null, 0)
        }
        this.loading = false
        if (currentMembers.length - 1 < this.maxRow && !diff) {
          this.load()
        }
      })
    })
  }

  handleSelect(_, selectedIndex) {
    const item = this.state.members[selectedIndex]
    if (item) {
      this.setState({selectedIndex})
    }
  }

  handleKeyDown(e) {
    const {selectedIndex, editableIndex, members} = this.state
    if (typeof selectedIndex === 'number' && typeof editableIndex !== 'number') {
      switch (e.keyCode) {
      case 8:
        this.deleteSelectedMember()
        return false
      case 38:
        if (selectedIndex > 0) {
          this.handleSelect(null, selectedIndex - 1)
        }
        return false
      case 40:
        if (selectedIndex < members.length - 1) {
          this.handleSelect(null, selectedIndex + 1)
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
        this.props.redis.zrem(this.state.keyName, deleted[0])
        const nextSelectedIndex = this.state.selectedIndex >= members.length - 1
          ? this.state.selectedIndex - 1
          : this.state.selectedIndex
        this.setState({members, length: this.state.length - 1}, () => {
          this.props.onKeyContentChange()
          this.handleSelect(null, nextSelectedIndex)
        })
      }
    })
  }

  showContextMenu(_, row) {
    this.handleSelect(null, row)

    const menu = remote.Menu.buildFromTemplate([
      {
        label: 'Copy Score to Clipboard',
        click: () => {
          clipboard.writeText(this.state.members[row][1])
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Edit Score',
        click: () => {
          this.setState({editableIndex: row})
        }
      },
      {
        label: 'Delete',
        click: () => {
          this.deleteSelectedMember()
        }
      }
    ])
    menu.popup(remote.getCurrentWindow())
  }

  renderTable() {
    return <Table
      rowHeight={24}
      rowsCount={this.state.length}
      rowClassNameGetter={this.rowClassGetter.bind(this)}
      onRowClick={this.handleSelect.bind(this)}
      onRowContextMenu={this.showContextMenu.bind(this)}
      onRowDoubleClick={(evt, index) => {
        this.handleSelect(evt, index)
        this.setState({editableIndex: index})
      }}
      isColumnResizing={false}
      onColumnResizeEndCallback={this.props.setSize.bind(null, 'score')}
      width={this.props.contentBarWidth}
      height={this.props.height}
      headerHeight={24}
      >
      {this.renderScoreColumn()}
      {this.renderMemberColumn()}
    </Table>
  }

  renderScoreColumn() {
    return <Column
    header={
      <SortHeaderCell
        title="score"
        onOrderChange={desc => this.setState({
          desc,
          members: [],
          selectedIndex: null
        })}
        desc={this.state.desc}
        />
    }
    width={this.props.scoreBarWidth}
    isResizable
    cell={({rowIndex}) => {
      const member = this.state.members[rowIndex]
      if (!member) {
        return ''
      }
      return (<ContentEditable
        className="ContentEditable overflow-wrapper"
        enabled={rowIndex === this.state.editableIndex}
        onChange={async (newScore) => {
          const members = this.state.members.slice()

          try {
            await this.props.redis.zadd(this.state.keyName, newScore, members[rowIndex][0])
            // Don't sort when changing scores
            members[rowIndex][1] = newScore
            this.setState({
              members,
              editableIndex: null
            })
          } catch (err) {
            alert(err.message)
            this.setState({
              editableIndex: null
            })
          }
          ReactDOM.findDOMNode(this.refs.table).focus()
        }}
        html={member[1]}
        />)
    }}
    />
  }

  renderMemberColumn() {
    return <Column
    header={
      <AddButton
        title="member" onClick={async () => {
          const res = await showModal({
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
          })
          const data = res['Value:']
          const score = res['Score:']
          const rank = await this.props.redis.zscore(this.state.keyName, data)
          if (rank !== null) {
            const error = 'Member already exists'
            alert(error)
            return
          }
          await this.props.redis.zadd(this.state.keyName, score, data)
          const members = this.state.members.slice()
          const newMember = [data, score]
          const index = sortedIndexBy(
            members,
            newMember,
            (member) => Number(member[1]) * (this.state.desc ? -1 : 1)
          )
          if (index < members.length - 1) {
            members.splice(index, 0, newMember)
            this.setState({
              members,
              length: this.state.length + 1
            }, () => {
              this.props.onKeyContentChange()
              this.handleSelect(null, index)
            })
          }
          alert('Added successfully')
        }}/>
    }
    width={this.props.contentBarWidth - this.props.scoreBarWidth}
    cell={({rowIndex}) => {
      const member = this.state.members[rowIndex]
      if (!member) {
        this.load(rowIndex)
        return 'Loading...'
      }
      return <div className="overflow-wrapper"><span>{member[0]}</span></div>
    }}
    />
  }

  renderEditor() {
    const item = this.state.members[this.state.selectedIndex]
    const buffer = item
      ? Buffer.from(item[0])
      : undefined
    return <Editor
      buffer={buffer}
      onSave={this.save.bind(this)}
      />
  }

  render() {
    return (<SplitPane
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
        {this.renderTable()}
      </div>
      {this.renderEditor()}
    </SplitPane>)
  }
}

export default ZSetContent
