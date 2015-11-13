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
        encoding: `Encoding: ${encoding}`,
        ttl: pttl >= 0 ? `TTL: ${humanFormat(pttl, { scale: timeScale }).replace(' ', '')}` : null,
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
    const desc = ['size', 'encoding', 'ttl']
    .map(key => ({ key, value: this.state[key]}))
    .filter(item => typeof item.value === 'string');
    return <footer className="toolbar toolbar-footer">
      {
        desc.map(({ key, value }) => <span
          key={key}
          style={ { margin: '0 5px' } }
        >{value}</span> )
      }
    </footer>;
  }
}

export default Footer;
