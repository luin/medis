'use strict'

import React from 'react'

class Footer extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    this.updateInfo()
    this.updateDBCount()
    this.interval = setInterval(this.updateInfo.bind(this), 10000)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.db !== this.props.db) {
      this.updateInfo()
    }
  }

  updateDBCount() {
    this.props.redis.config('get', 'databases', (err, res) => {
      if (!err && res[1]) {
        this.setState({databases: Number(res[1])})
      } else {
        const redis = this.props.redis.duplicate()
        const select = redis.select.bind(redis)
        this.guessDatabaseNumber(select, 15).then(count => {
          return typeof count === 'number' ? count : this.guessDatabaseNumber(select, 1, 0)
        }).then(count => {
          this.setState({databases: count + 1})
        })
      }
    })
  }

  updateInfo() {
    this.props.redis.info((err, res) => {
      if (err) {
        return
      }
      const info = {}

      const lines = res.split('\r\n')
      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(':')
        if (parts[1]) {
          info[parts[0]] = parts[1]
        }
      }

      this.setState(info)
    })
  }

  guessDatabaseNumber(select, startIndex, lastSuccessIndex) {
    if (startIndex > 30) {
      return Promise.resolve(30)
    }
    return select(startIndex)
    .then(() => {
      return this.guessDatabaseNumber(select, startIndex + 1, startIndex)
    }).catch(err => {
      if (typeof lastSuccessIndex === 'number') {
        return lastSuccessIndex
      }
      return null
    })
  }

  componentWillUnmount() {
    clearInterval(this.interval)
    this.interval = null
  }

  handleChange(evt) {
    const db = Number(evt.target.value)
    this.props.onDatabaseChange(db)
  }

  keyCountByDb(dbNumber){
    const db = `db${dbNumber}`
    let keys = 0
    if (this.state[db]) {
      const match = this.state[db].match(/keys=(\d+)/)
      if (match) {
        keys = match[1]
      }
    }
    return keys
  }

  render() {
    const keys = this.keyCountByDb(this.props.db)
    return (<footer className="toolbar toolbar-footer">
      <span style={{marginLeft: 6}}>Keys: {keys}</span>
      <div style={{float: 'right'}}>
        <span>DB:</span>
        <select
          onChange={this.handleChange.bind(this)}
          value={this.props.db} className="form-control" style={{
            width: 50,
            marginTop: 2,
            marginRight: 2,
            marginLeft: 3,
            fontSize: 10,
            float: 'right'
          }}
        >
          {(max => {
            return new Array(max).fill(0).map((value, db) => {
              return (
                <option key={db} value={db}>
                  {db} {this.keyCountByDb(db) > 0 ? `(${this.keyCountByDb(db)})` : ''}
                </option>
              );
            });
          })(this.state.databases || 1)}
        </select>
      </div>
    </footer>)
  }
}

export default Footer
