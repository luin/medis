'use strict'

import React from 'react'
import BaseContent from './BaseContent'
import SplitPane from 'react-split-pane'
import {Table, Column} from 'fixed-data-table-contextmenu'
import Editor from './Editor'
import SortHeaderCell from './SortHeaderCell'
import AddButton from '../../../../AddButton'
import ContentEditable from '../../../../ContentEditable'
import ReactDOM from 'react-dom'
import {clipboard} from 'electron'

require('./BaseContent/index.scss')

class ZSetContent extends BaseContent {
  save(value, callback) {
    if (typeof this.state.selectedIndex === 'number') {
      const item = this.state.members[this.state.selectedIndex]
      const oldValue = item[0]
      item[0] = value.toString()
      this.setState({members: this.state.members})
      this.props.redis.multi().zrem(this.state.keyName, oldValue).zadd(this.state.keyName, item[1], value).exec((err, res) => {
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
    const from = this.state.members.length
    const to = Math.min(from === 0 ? 200 : from + 1000, this.state.length - 1)

    this.props.redis.zrange(this.state.keyName, from, to, 'WITHSCORES', (_, results) => {
      const items = []
      for (let i = 0; i < results.length - 1; i += 2) {
        items.push([results[i], results[i + 1]])
      }
      const diff = to - from + 1 - items.length
      this.setState({
        members: this.state.members.concat(items),
        length: this.state.length - diff
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

  handleSelect(evt, selectedIndex) {
    const item = this.state.members[this.state.desc ? this.state.length - 1 - selectedIndex : selectedIndex]
    if (item) {
      this.setState({selectedIndex, content: item[0]})
    }
  }

  handleKeyDown(e) {
    if (typeof this.state.selectedIndex === 'number' && typeof this.state.editableIndex !== 'number') {
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
      const index = this.state.desc ? this.state.length - 1 - this.state.selectedIndex : this.state.selectedIndex
      const deleted = members.splice(index, 1)
      if (deleted.length) {
        this.props.redis.zrem(this.state.keyName, deleted[0])
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

  componentDidMount() {
    super.componentDidMount()
    $.contextMenu({
      context: ReactDOM.findDOMNode(this.refs.table),
      selector: '.' + this.randomClass,
      trigger: 'none',
      zIndex: 99999,
      callback: (key, opt) => {
        setTimeout(() => {
          if (key === 'delete') {
            this.deleteSelectedMember()
          } else if (key === 'copy') {
            clipboard.writeText(this.state.members[this.state.selectedIndex][0])
          } else if (key === 'edit') {
            this.setState({editableIndex: this.state.selectedIndex})
          }
        }, 0)
        ReactDOM.findDOMNode(this.refs.table).focus()
      },
      items: {
        copy: {name: 'Copy Score to Clipboard'},
        sep1: '---------',
        edit: {name: 'Edit Score'},
        delete: {name: 'Delete'}
      }
    })
  }

  showContextMenu(e, row) {
    this.handleSelect(null, row)
    $(ReactDOM.findDOMNode(this.refs.table)).contextMenu({
      x: e.pageX,
      y: e.pageY,
      zIndex: 99999
    })
  }

  render() {
    return (<SplitPane
        minSize="80"
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
            width={this.props.scoreBarWidth}
            isResizable
            cell={({rowIndex}) => {
              const member = this.state.members[this.state.desc ? this.state.length - 1 - rowIndex : rowIndex]
              if (!member) {
                return ''
              }
              return (<ContentEditable
                className="ContentEditable overflow-wrapper"
                enabled={rowIndex === this.state.editableIndex}
                onChange={newScore => {
                  const members = this.state.members
                  const member = members[rowIndex]
                  const keyName = this.state.keyName
                  this.props.redis.zadd(keyName, newScore, member[0]).then(() => {
                    member[1] = newScore
                    const updatedMembers = members.sort((a, b) => {
                      return Number(a[1]) - Number(b[1])
                    })
                    this.setState({
                      members: updatedMembers
                    }, () => {
                      for (let i = 0; i < updatedMembers.length; i++) {
                        if (updatedMembers[i][0] === member[0]) {
                          this.handleSelect(null, i)
                          break
                        }
                      }
                    })
                  })
                  this.setState({editableIndex: null})
                  ReactDOM.findDOMNode(this).focus()
                }}
                html={member[1]}
                />)
            }}
            />
          <Column
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
                        },
                        'Score:': {
                          type: 'number'
                        }
                      }
                    }
                  }).then(res => {
                    const data = res['Value:']
                    const score = res['Score:']
                    return this.props.redis.zscore(this.state.keyName, data).then(rank => {
                      if (rank !== null) {
                        const error = 'Member already exists'
                        alert(error)
                        throw new Error(error)
                      }
                      return {data, score}
                    })
                  }).then(({data, score}) => {
                    this.props.redis.zadd(this.state.keyName, score, data).then(() => {
                      this.state.members.push([data, score])
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
            width={this.props.contentBarWidth - this.props.scoreBarWidth}
            cell={({rowIndex}) => {
              const member = this.state.members[this.state.desc ? this.state.length - 1 - rowIndex : rowIndex]
              if (!member) {
                this.load(rowIndex)
                return 'Loading...'
              }
              return <div className="overflow-wrapper"><span>{member[0]}</span></div>
            }}
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

export default ZSetContent
