'use strict';

import React from 'react';
import humanFormat from 'human-format';

const timeScale = new humanFormat.Scale({
  ms: 1,
  s: 1000,
  min: 60000,
  h: 3600000,
  d: 86400000
});

class Footer extends React.Component {
  constructor() {
    super();
    this.resetState(true);
  }

  resetState(sync) {
    const values = {
      ttl: null,
      encoding: null,
      size: null
    };
    if (sync) {
      this.state = values;
    } else {
      this.setState(values);
    }
  }

  init() {
    if (!this.props.keyType && this.props.keyType !== 'none') {
      this.resetState();
      return;
    }
    const key = this.props.keyName;
    const pipeline = this.props.redis.pipeline()
    pipeline.pttl(key)
    pipeline.object('ENCODING', key)

    let sizeUnit = 'Members';
    switch (this.props.keyType) {
    case 'string': pipeline.strlen(key); sizeUnit = 'Bytes'; break;
    case 'hash': pipeline.hlen(key); break;
    case 'list': pipeline.llen(key); break;
    case 'set': pipeline.scard(key); break;
    case 'zset': pipeline.zcard(key); break;
    }

    pipeline.exec((err, [[err1, pttl], [err2, encoding], res3]) => {
      this.setState({
        encoding,
        ttl: pttl >= 0 ? humanFormat(pttl, { scale: timeScale }).replace(' ', '') : null,
        size: res3 ? `${sizeUnit}: ${res3[1]}` : null
      });
    });
  }

  componentDidMount() {
    this.init(this.props.keyName);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyName !== this.props.keyName || nextProps.keyType !== this.props.keyType) {
      this.init(nextProps.keyName);
    }
  }

  render() {
    const desc = [];
    if (typeof this.state.size === 'string') {
      desc.push(`${this.state.size}`);
    }
    if (typeof this.state.encoding === 'string') {
      desc.push(`Encoding: ${this.state.encoding}`);
    }
    if (typeof this.state.ttl === 'string') {
      desc.push(`TTL: ${this.state.ttl}`);
    }
    return <footer className="toolbar toolbar-footer">
      { desc.map(item => <span style={ { margin: '0 5px' } }>{item}</span> ) }
    </footer>;
  }
}

export default Footer;
