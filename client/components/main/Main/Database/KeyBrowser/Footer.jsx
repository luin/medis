'use strict';

import React from 'react';

class Footer extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    this.updateInfo();
    this.interval = setInterval(this.updateInfo.bind(this), 10000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.db !== this.props.db) {
      this.updateInfo();
    }
  }

  updateInfo() {
    this.props.redis.info((err, res) => {
      if (err) {
        return;
      }
      const info = {};

      const lines = res.split('\r\n');
      for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(':');
        if (parts[1]) {
          info[parts[0]] = parts[1];
        }
      }

      this.setState(info);
    });

    this.props.redis.config('get', 'databases', (err, res) => {
      if (res && res[1]) {
        this.setState({ databases: Number(res[1]) });
      }
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.interval = null;
  }

  handleChange(evt) {
    const db = Number(evt.target.value);
    this.props.onDatabaseChange(db);
  }

  render() {
    const db = `db${this.props.db}`;
    let keys = 0;
    if (this.state[db]) {
      const match = this.state[db].match(/keys=(\d+)/);
      if (match) {
        keys = match[1];
      }
    }
    return <footer className="toolbar toolbar-footer">
      <span style={ { marginLeft: 6 } }>Keys: {keys}</span>
      <div style={ { float: 'right' } }>
        <span>DB:</span>
        <select
          onChange={this.handleChange.bind(this)}
          value={this.props.db} className="form-control" style={ {
            width: 50,
            marginTop: 2,
            marginRight: 2,
            marginLeft: 3,
            fontSize: 10,
            float: 'right'
          } }
        >
        {
          ((max) => {
            const items = [];
            for (let i = 0; i < max; i++) {
              items.push(<option
                key={i} value={i}
              >{i}</option>);
            }
            return items;
          })(this.state.databases)
        }
      </select>
    </div>
  </footer>;
  }
}

export default Footer;
