'use strict';

import React from 'react';

class Footer extends React.Component {
  constructor() {
    super();
    this.state = { currentDB: 0 };
  }

  componentDidMount() {
    this.updateInfo();
    this.interval = setInterval(this.updateInfo.bind(this), 10000);
  }

  updateInfo() {
    this.props.redis.info((err, res) => {
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
    const newDB = Number(evt.target.value);
    this.setState({ currentDB: newDB });
    this.updateInfo();
    this.props.onDatabaseChange(newDB);
  }

  render() {
    const currentDB = `db${this.state.currentDB}`;
    let keys = 0;
    if (this.state[currentDB]) {
      const match = this.state[currentDB].match(/keys=(\d+)/);
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
          value={this.state.currentDB} className="form-control" style={ {
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
