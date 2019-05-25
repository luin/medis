'use strict'

import React from 'react'
import BaseContent from '.'
import SplitPane from 'react-split-pane'
import {Table, Column} from 'fixed-data-table-contextmenu'
import Editor from './Editor'
import SortHeaderCell from './SortHeaderCell'
import AddButton from '../../../AddButton'
import {remote} from 'electron'

class ListContent extends BaseContent {
  save(value, callback) {
    const {selectedIndex, keyName, desc} = this.state
    if (typeof selectedIndex === 'number') {
      const members = this.state.members.slice()
      members[selectedIndex] = value.toString()
      this.setState({members})
      this.props.redis.lset(keyName, desc ? -1 - selectedIndex : selectedIndex, value, (err, res) => {
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

    const {members, length, keyName, desc} = this.state
    let from = members.length
    let to = Math.min(from === 0 ? 200 : from + 1000, length - 1)
    if (to < from) {
      this.loading = false
      return
    }
    if (desc) {
      [from, to] = [-1 - to, -1 - from]
    }

    this.props.redis.lrange(keyName, from, to, (_, results) => {
      if (this.state.desc !== desc) {
        // TODO: use a counter instead to avoid
        // cancel multiple loading attempts.
        // LIST & ZSET
        this.loading = false
        return
      }
      if (desc) {
        results.reverse()
      }
      const diff = to - from + 1 - results.length
      this.setState({
        members: members.concat(results),
        length: length - diff
      }, () => {
        if (typeof this.state.selectedIndex !== 'number' && this.state.members.length) {
          this.handleSelect(null, 0)
        }
        this.loading = false
        if (this.state.members.length - 1 < this.maxRow && !diff) {
          this.load()
        }
      })
    })
  }

  handleSelect(_, selectedIndex) {
    if (typeof this.state.members[selectedIndex] === 'undefined') {
      this.setState({selectedIndex: null})
    } else {
      this.setState({selectedIndex})
    }
  }

  async deleteSelectedMember() {
    if (typeof this.state.selectedIndex !== 'number') {
      return
    }
    await showModal({
      title: 'Delete selected item?',
      button: 'Delete',
      content: 'Are you sure you want to delete the selected item? This action cannot be undone.'
    })
    const {selectedIndex, desc, length, keyName} = this.state
    const members = this.state.members.slice()
    const deleted = members.splice(selectedIndex, 1)
    if (deleted.length) {
      this.props.redis.lremindex(keyName, desc ? -1 - selectedIndex : selectedIndex)

      const nextSelectedIndex = selectedIndex >= members.length - 1
        ? selectedIndex - 1
        : selectedIndex
      this.setState({members, length: length - 1}, () => {
        this.props.onKeyContentChange()
        this.handleSelect(null, nextSelectedIndex)
      })
    }
  }

  handleKeyDown(e) {
    if (typeof this.state.selectedIndex === 'number') {
      switch (e.keyCode) {
      case 8:
        this.deleteSelectedMember()
        return false
      case 38:
        if (this.state.selectedIndex > 0) {
          this.handleSelect(null, this.state.selectedIndex - 1)
        }
        return false
      case 40:
        if (this.state.selectedIndex < this.state.members.length - 1) {
          this.handleSelect(null, this.state.selectedIndex + 1)
        }
        return false
      }
    }
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

  renderEditor() {
    const content = this.state.members[this.state.selectedIndex]
    const buffer = typeof content === 'string'
      ? Buffer.from(content)
      : undefined
    return <Editor
      buffer={buffer}
      onSave={this.save.bind(this)}
      />
  }

  renderIndexColumn() {
    return <Column
      header={
        <SortHeaderCell
          title="index"
          onOrderChange={desc => this.setState({
            desc,
            members: [],
            selectedIndex: null
          })}
          desc={this.state.desc}
          />
      }
      width={this.props.indexBarWidth}
      isResizable
      cell={({rowIndex}) => {
        return <div className="index-label">{ this.state.desc ? this.state.length - 1 - rowIndex : rowIndex }</div>
      }}
      />
  }

  renderValueColumn() {
    return <Column
      header={
        <AddButton
          title="item" onClick={async () => {
            const res = await showModal({
              button: 'Insert Item',
              form: {
                type: 'object',
                properties: {
                  'Insert To:': {
                    type: 'string',
                    enum: ['head', 'tail']
                  }
                }
              }
            })
            const insertToHead = res['Insert To:'] === 'head'
            const method = insertToHead ? 'lpush' : 'rpush'
            const data = 'New Item'
            await this.props.redis[method](this.state.keyName, data)

            const members = this.state.members.slice()
            members[insertToHead ? 'unshift' : 'push'](data)
            this.setState({
              members,
              length: this.state.length + 1
            }, () => {
              this.props.onKeyContentChange()
              if (insertToHead) {
                this.handleSelect(null, 0)
              }
            })
          }}
        />
      }
      width={this.props.contentBarWidth - this.props.indexBarWidth}
      cell={({rowIndex}) => {
        const data = this.state.members[rowIndex]
        if (typeof data === 'undefined') {
          this.load(rowIndex)
          return 'Loading...'
        }
        return <div className="overflow-wrapper"><span>{data}</span></div>
      }}
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
        tabIndex="0"
        ref="table"
        onKeyDown={this.handleKeyDown.bind(this)}
        className={'base-content ' + this.randomClass}
        >
        <Table
          rowHeight={24}
          rowsCount={this.state.length}
          rowClassNameGetter={this.rowClassGetter.bind(this)}
          onRowClick={this.handleSelect.bind(this)}
          onRowContextMenu={this.showContextMenu.bind(this)}
          isColumnResizing={false}
          onColumnResizeEndCallback={this.props.setSize.bind(null, 'index')}
          width={this.props.contentBarWidth}
          height={this.props.height}
          headerHeight={24}
          >
          {this.renderIndexColumn()}
          {this.renderValueColumn()}
        </Table>
      </div>
      {this.renderEditor()}
    </SplitPane>)
  }
}

export default ListContent
