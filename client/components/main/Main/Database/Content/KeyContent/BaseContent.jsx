'use strict';

import React from 'react';

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
  }

  init() {
    this.loading = false;
    this.setState(getDefaultState());

    const { redis, keyType, keyName } = this.props;

    const method = {
      string: 'strlen',
      list: 'llen',
      set: 'scard',
      zset: 'zcard',
      hash: 'hlen'
    }[keyType];

    redis[method](keyName, (_, length) => {
      this.setState({ keyName, length });
    });
  }

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
    if (!item) {
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
