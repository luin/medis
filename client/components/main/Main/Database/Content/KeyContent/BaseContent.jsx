'use strict';

import React from 'react';

require('./BaseContent.scss');

const getDefaultState = function () {
  return {
    keyName: null,
    content: null,
    desc: false,
    length: 0,
    members: []
  };
};

class BaseContent extends React.Component {
  constructor() {
    super();
    this.state = getDefaultState();
    this.state.sidebarWidth = 200;
    this.maxRow = 0;
    this.cursor = 0;
    this.randomClass = 'base-content-' + (Math.random() * 100000 | 0);
  }

  init(keyName) {
    this.loading = false;
    this.setState(getDefaultState());

    const { redis, keyType } = this.props;

    const method = {
      string: 'strlen',
      list: 'llen',
      set: 'scard',
      zset: 'zcard',
      hash: 'hlen'
    }[keyType];

    console.log('keyType', keyType, keyName);

    redis[method](keyName).then(length => {
      this.setState({ keyName, length: length || 0 });
      if (typeof length !== 'number') {
        this.create().then(() => {
          this.init(keyName);
        }).catch(err => {
          alert(err.message);
        });
      }
    });
  }

  // create() {
  //   const { redis, keyType, keyName } = this.props;
  //   let schema;
  // }

  load(index) {
    if (index > this.maxRow) {
      this.maxRow = index;
    }
    if (this.loading) {
      return;
    }
    this.loading = true;
    return true;
  }

  rowClassGetter(index) {
    const item = this.state.members[index];
    if (typeof item === 'undefined') {
      return 'type-list is-loading';
    }
    if (index === this.state.selectedIndex) {
      return 'type-list is-selected';
    }
    return 'type-list';
  }

  componentDidMount() {
    this.init(this.props.keyName);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyName !== this.props.keyName && nextProps.keyName) {
      this.init(nextProps.keyName);
    }
  }

  componentWillUnmount() {
    this.setState = function () {};
  }
}

export default BaseContent;
