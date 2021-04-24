'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import {Table, Column} from 'fixed-data-table-contextmenu'
import ContentEditable from '../../ContentEditable'
import AddButton from '../../AddButton'
import zip from 'lodash.zip'
import {clipboard, remote} from 'electron'

import emitter from "../../../../../../../main/ev"

require('./index.scss')

class KeyList extends React.Component {
  state = {
    keys: [],
    selectedKey: null,
    sidebarWidth: 300,
    cursor: '0',
    isSelectedAllRows:false,
    selectedKeys:[],
  }

  randomClass = 'pattern-table-' + (Math.random() * 100000 | 0)

  refresh(firstTime) {
    this.setState({
      cursor: '0',
      keys: [],
      isSelectedAllRows:false,
      selectedKeys:[],
    }, () => {
      this.handleSelect()
      this.scan(firstTime)
      emitter.emit("updateDBCount")
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.db !== this.props.db) {
      this.props.redis.select(nextProps.db)
    }

    const needRefresh = nextProps.db !== this.props.db ||
      nextProps.pattern !== this.props.pattern ||
      nextProps.redis !== this.props.redis

    if (needRefresh) {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
      this.timer = setTimeout(() => {
        this.refresh(true)
      }, 200)
    }
  }

  scan(firstTime) {
    const scanKey = this.scanKey = Math.random() * 10000 | 0
    if (this.scanning) {
      this.lastFirstTime = firstTime
      return
    }
    this.scanning = true
    this.setState({scanning: true})

    const redis = this.props.redis

    const targetPattern = this.props.pattern
    let pattern = targetPattern
    if (pattern.indexOf('*') === -1 && pattern.indexOf('?') === -1) {
      pattern += '*'
    }

    let count = 0
    let cursor = this.state.cursor

    let filterKey
    let filterKeyExists

    // Plain key
    if (targetPattern !== pattern) {
      filterKey = targetPattern
      if (this.state.keys.length) {
        iter.call(this, 100, 1)
      } else {
        redis.type(targetPattern, (err, type) => {
          if (type !== 'none') {
            this.setState({
              keys: this.state.keys.concat([[targetPattern, type]])
            })
            filterKeyExists = true
            if (firstTime) {
              iter.call(this, 1, 1)
              return
            }
          }
          iter.call(this, 100, 1)
        })
      }
    } else {
      iter.call(this, 100, 1)
    }

    function iter(fetchCount, times) {
      redis.scan(cursor, 'MATCH', pattern, 'COUNT', fetchCount, (err, res) => {
        if (this.scanKey !== scanKey) {
          this.scanning = false
          setTimeout(this.scan.bind(this, this.lastFirstTime), 0)
          return
        }
        const newCursor = res[0]
        let fetchedKeys = res[1]
        let promise
        if (fetchedKeys.length) {
          if (filterKey) {
            fetchedKeys = fetchedKeys.filter(key => key !== filterKey)
          }
          count += fetchedKeys.length
          const pipeline = redis.pipeline()
          fetchedKeys.forEach(key => pipeline.type(key))
          promise = pipeline.exec()
        } else {
          promise = Promise.resolve([])
        }
        promise.then(types => {
          if (this.props.pattern !== targetPattern) {
            this.scanning = false
            setTimeout(this.scan.bind(this), 0)
            return
          }
          const keys = zip(fetchedKeys, types.map(res => res[1]))

          let needContinue = true
          if (filterKeyExists && firstTime) {
            needContinue = false
          } else if (Number(newCursor) === 0) {
            needContinue = false
          } else if (count >= 100) {
            needContinue = false
          } else if (count > 0 && times > 200) {
            needContinue = false
          }
          cursor = newCursor

          let newKeys=this.state.keys.concat(keys)
          newKeys.sort((a,b)=>{
            if (a[0]<b[0]) {
              return -1;
            } else if (a[0]>b[0]) {
              return 1;
            } else {
              return 0;
            }
          })
          if (needContinue) {
            this.setState({
              cursor,
              keys: newKeys
            }, () => {
              iter.call(this, count < 10 ? 5000 : (count < 50 ? 2000 : 1000), times + 1)
              if (typeof this.index !== 'number') {
                this.handleSelect(0)
              }
            })
          } else {
            this.setState({
              cursor,
              scanning: false,
              keys: newKeys
            }, () => {
              this.scanning = false
              if (typeof this.index !== 'number') {
                this.handleSelect(0)
              }
            })
          }
        })
      })
    }
  }

  handleSelect(index, force) {
    if (index === this.index && !force) {
      return
    }
    const item = this.state.keys[index]
    if (item && typeof item[0] !== 'undefined') {
      const key = item[0]
      this.index = index
      const editableKey = this.state.editableKey === key ? this.state.editableKey : null
      this.setState({selectedKey: item[0], editableKey})
      this.props.onSelect(item[0])
    } else {
      this.index = null
      this.setState({selectedKey: null, editableKey: null})
      this.props.onSelect(null)
    }
  }
  deleteAllKeys() {
    showModal({
      title: 'Delete all keys?',
      button: 'Delete',
      content: 'Are you sure you want to delete all the keys? This action cannot be undone.'
    }).then(() => {
      let keys = this.state.keys
      keys.forEach(key=>{
        this.props.redis.del(key[0])
      })
      this.refresh()
    }).catch(() => {})
  }
  deleteSelectedKeys() {
    showModal({
      title: 'Delete selected keys?',
      button: 'Delete',
      content: 'Are you sure you want to delete the selected keys? This action cannot be undone.'
    }).then(() => {
      let keys = this.state.keys
      keys.forEach((key,i)=>{
        if(this.state.selectedKeys[i]){
          this.props.redis.del(this.state.selectedKeys[i][0])
        }
      })
      this.refresh()

    }).catch(() => {})
  }
  deleteSelectedKey() {
    if (typeof this.index !== 'number') {
      return
    }
    showModal({
      title: 'Delete selected key?',
      button: 'Delete',
      content: 'Are you sure you want to delete the selected key? This action cannot be undone.'
    }).then(() => {
      const keys = this.state.keys
      const deleted = keys.splice(this.index, 1)
      if (deleted.length) {
        this.props.redis.del(deleted[0][0])
        if (this.index >= keys.length - 1) {
          this.index -= 1
        }
        this.setState({keys}, () => {
          this.handleSelect(this.index, true)
        })
      }
    }).catch(() => {})
  }

  componentDidMount() {
    $(ReactDOM.findDOMNode(this)).on('keydown', e => {
      if (typeof this.index === 'number' && typeof this.state.editableKey !== 'string') {
        if (e.keyCode === 8) {
          this.deleteSelectedKey()
          return false
        }
        if (e.keyCode === 38) {
          this.handleSelect(this.index - 1)
          return false
        }
        if (e.keyCode === 40) {
          this.handleSelect(this.index + 1)
          return false
        }
      }
      if (!e.ctrlKey && e.metaKey) {
        if (e.keyCode === 67) {
          clipboard.writeText(this.state.keys[this.index][0])
          return false
        }
        if (e.keyCode === 82) {
          this.refresh()
          return false
        }
      }
      return true
    })
    this.scan()
  }

  setTTLforKey() {
    const {redis, onKeyMetaChange} = this.props
    redis.pttl(this.state.selectedKey).then(ttl => {
      showModal({
        button: 'Set Expiration',
        form: {
          type: 'object',
          properties: {
            'PTTL (ms):': {
              type: 'number',
              minLength: 1,
              default: ttl
            }
          }
        }
      }).then(res => {
        const ttl = Number(res['PTTL (ms):'])
        if (ttl >= 0) {
          redis.pexpire(this.state.selectedKey, ttl).then(res => {
            if (res <= 0) {
              alert('Update Failed')
            }
            onKeyMetaChange()
          })
        } else {
          redis.persist(this.state.selectedKey, () => {
            onKeyMetaChange()
          })
        }
      })
    })
  }

  duplicateKey() {
    const sourceKey = this.state.keys[this.index][0]
    let targetKey
    showModal({
      button: 'Duplicate Key',
      form: {
        type: 'object',
        properties: {
          'Target Key:': {
            type: 'string',
            minLength: 1
          },
          'Keep TTL:': {
            type: 'boolean'
          }
        }
      }
    }).then(res => {
      targetKey = res['Target Key:']
      const duplicateTTL = res['Keep TTL:']
      this.props.redis.duplicateKey(sourceKey, targetKey, duplicateTTL ? 'TTL' : 'NOTTL')
    }).then(() => {
      this.props.onCreateKey(targetKey)
    }).catch(err => {
      if (err && err.message) {
        alert(err.message)
      }
    })
  }

  createKey(key, type) {
    const redis = this.props.redis
    switch (type) {
    case 'string':
      return redis.set(key, '')
    case 'list':
      return redis.lpush(key, 'New Item')
    case 'hash':
      return redis.hset(key, 'New Key', 'New Value')
    case 'set':
      return redis.sadd(key, 'New Member')
    case 'zset':
      return redis.zadd(key, 0, 'New Member')
    }
  }

  showContextMenu(e, row) {
    this.handleSelect(row)

    const menu = remote.Menu.buildFromTemplate([
      {
        label: 'Copy to Clipboard',
        click: () => {
          clipboard.writeText(this.state.keys[row][0])
        }
      },
      {
        label: 'Reload',
        click: () => {
          this.handleSelect(row, true)
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Set expiration',
        click: () => {
          this.setTTLforKey()
        }
      },
      {
        label: 'Rename Key...',
        click: () => {
          this.setState({editableKey: this.state.keys[row][0]})
        }
      },
      {
        label: 'Duplicate Key...',
        click: () => {
          this.duplicateKey()
        }
      },
      {
        label: 'Delete',
        click: () => {
          this.deleteSelectedKey()
        }
      },
      {
        label: 'Delete Selected',
        click: () => {
          this.deleteSelectedKeys()
        }
      },
      {
        label: 'Delete All',
        click: () => {
          this.deleteAllKeys()
        }
      }
    ])
    menu.popup(remote.getCurrentWindow())
  }
  selectAllRows(isSelectedAllRows){
    this.setState({isSelectedAllRows:isSelectedAllRows})
    if(isSelectedAllRows){
      this.setState({selectedKeys:this.state.keys})
    }else{
      this.setState({selectedKeys:[]})
    }
    this.forceUpdate(()=>{
    })
  }

  selectRow(isSelected,rowIndex){
    const item = this.state.keys[rowIndex]
    let selectedKeys=JSON.parse(JSON.stringify(this.state.selectedKeys))
    if(isSelected){
      selectedKeys[rowIndex]=this.state.keys[rowIndex]
        let isSelectedAllRows=true
        this.state.keys.forEach((d,i)=> {
          if (!selectedKeys[i]) {
            isSelectedAllRows = false
          }
        })
      this.setState({isSelectedAllRows:isSelectedAllRows})
    }else{
      selectedKeys[rowIndex]=null
      this.setState({isSelectedAllRows:false})
    }
    this.setState({selectedKeys:selectedKeys})
    // this.index = null
    // this.setState({selectedKey: null, editableKey: null})
    // this.props.onSelect(null)
    this.forceUpdate(()=>{
    })
  }
  render() {
    return (<div
      tabIndex="0"
      className={'pattern-table ' + this.randomClass}
      >
      <Table
        rowHeight={24}
        rowsCount={this.state.keys.length + (this.state.cursor === '0' ? 0 : 1)}
        onScrollStart={() => {
          if (this.state.editableKey) {
            this.setState({editableKey: null})
          }
        }}
        rowClassNameGetter={index => {
          const item = this.state.keys[index]
          if (!item) {
            return 'is-loading'
          }
          if (item[0] === this.state.selectedKey) {
            return 'is-selected'
          }
          return ''
        }}
        onRowContextMenu={this.showContextMenu.bind(this)}
        onRowClick={(evt, index) => this.handleSelect(index)}
        onRowDoubleClick={(evt, index) => {
          this.handleSelect(index)
          this.setState({editableKey: this.state.keys[index][0]})
        }}
        width={this.props.width}
        height={this.props.height}
        headerHeight={24}
        >
        <Column
          header={() => {
            return <input
              type={'checkbox'}
              onClick={e => {e.stopPropagation()}}
              onDoubleClick={e => {e.stopPropagation()}}
              onChange={(e) => {
                this.selectAllRows(e.target.checked)
              }}
              checked={this.state.isSelectedAllRows}
            ></input>
          }}
          width={20}
          cell={({rowIndex}) => {
            const item = this.state.keys[rowIndex]
            if (!item) {
              return ''
            }

            return <input
              type={'checkbox'}
              onClick={e => {e.stopPropagation()}}
              onDoubleClick={e => {e.stopPropagation()}}
              onChange={(e) => {
                this.selectRow(e.target.checked, rowIndex)
              }}
              checked={!!this.state.selectedKeys[rowIndex]}
            ></input>
          }}
        />
        <Column
          header="type"
          width={40}
          cell={({rowIndex}) => {
            const item = this.state.keys[rowIndex]
            if (!item) {
              return ''
            }
            const cellData = item[1]
            if (!cellData) {
              return ''
            }
            const type = cellData === 'string' ? 'str' : cellData
            return <span className={`key-type ${type}`}>{type}</span>
          }}
          />
        <Column
          header={
            <AddButton
              reload="true" title="name" onReload={() => {
                this.refresh()
              }} onClick={() => {
                showModal({
                  button: 'Create Key',
                  form: {
                    type: 'object',
                    properties: {
                      'Key Name:': {
                        type: 'string',
                        minLength: 1
                      },
                      'Type:': {
                        type: 'string',
                        enum: ['string', 'hash', 'list', 'set', 'zset']
                      }
                    }
                  }
                }).then(res => {
                  const key = res['Key Name:']
                  const type = res['Type:']
                  return this.props.redis.exists(key).then(exists => {
                    const error = 'The key already exists'
                    if (exists) {
                      alert(error)
                      throw new Error(error)
                    }
                    return {key, type}
                  })
                }).then(({key, type}) => {
                  this.createKey(key, type).then(() => {
                    this.props.onCreateKey(key)
                  })
                })
              }}
                 />
          }
          width={this.props.width - 60}
          cell={({rowIndex}) => {
            const item = this.state.keys[rowIndex]
            let cellData
            if (item) {
              cellData = item[0]
            }
            if (typeof cellData === 'undefined') {
              if (this.state.scanning) {
                return <span style={{color: '#ccc'}}>Scanning...(cursor {this.state.cursor})</span>
              }
              return (<a
                href="#" style={{color: '#666'}} onClick={evt => {
                  evt.preventDefault()
                  this.scan()
                }}>Scan more</a>)
            }
            return (<ContentEditable
              className="ContentEditable overflow-wrapper"
              enabled={cellData === this.state.editableKey}
              onChange={newKeyName => {
                const keys = this.state.keys
                const oldKey = keys[rowIndex][0]
                if (oldKey !== newKeyName && newKeyName) {
                  this.props.redis.exists(newKeyName).then(exists => {
                    if (exists) {
                      return showModal({
                        title: 'Overwrite the key?',
                        button: 'Overwrite',
                        content: `Key "${newKeyName}" already exists. Are you sure you want to overwrite this key?`
                      })
                    }
                  }).then(() => {
                    keys[rowIndex] = [newKeyName, keys[rowIndex][1]]
                    this.props.redis.rename(oldKey, newKeyName)
                    let found
                    for (let i = 0; i < keys.length; i++) {
                      if (i !== rowIndex && keys[i][0] === newKeyName) {
                        keys.splice(i, 1)
                        found = i
                        break
                      }
                    }
                    if (typeof found === 'number') {
                      if (this.index >= found) {
                        this.index -= 1
                      }
                      this.setState({keys}, () => {
                        this.handleSelect(this.index, true)
                      })
                    } else {
                      this.setState({keys})
                    }
                  }).catch(() => {})
                }
                this.setState({editableKey: null})
                ReactDOM.findDOMNode(this).focus()
              }}
              html={cellData}
              />)
          }}
          />
      </Table>
    </div>)
  }
}

export default KeyList
