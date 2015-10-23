'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import store from '../../../store';
import action from '../../../actions';
// import KeySelector from './KeySelector';
import { Table, Column } from 'fixed-data-table';
import SplitPane from 'react-split-pane';

class Database extends React.Component {
  constructor() {
    super();
    this.state = {
      keys: [],
      sidebarWidth: 300,
      patternDropdown: false
    };
  }

  componentDidMount() {
    const redis = this.props.redis;

    redis.scan('0', 'MATCH', 'fh:*', 'COUNT', '200', (_, res) => {
      Promise.all(res[1].map(key => {
        return Promise.all([key, redis.type(key)]);
      })).then(keys => {
        console.log(keys);
        this.setState({
          keys
        });
      });
    });

    window.addEventListener('resize', this._update.bind(this), false);
    this._update();
  }

  _update() {
    const node = ReactDOM.findDOMNode(this);

    window.node = node;
    this.setState({
      windowWidth: node.clientWidth,
      windowHeight: node.clientHeight
    });
  }

  handleSelectPattern() {
    console.log(arguments);
  }

  render() {
    console.log('render', this.state.patternDropdown);
    function rowGetter(rowIndex) {
      return this.state.keys[rowIndex];
    }
    return <SplitPane
        className="pane-group"
        minSize="100"
        split="vertical"
        defaultSize={300}
        ref="node"
        onChange={size => {
          this.setState({ 'sidebarWidth': size });
        }}
      >
      <div className="pane sidebar">
        <div className="pattern-input">
          <span className="icon icon-search"></span>
          <input type="search" className="form-control" placeholder="Key name or patterns" />
          <span
            className={`icon icon-down-open${this.state.patternDropdown ? ' is-active' : ''}`}
            onClick={() => this.setState({ patternDropdown: !this.state.patternDropdown }) }
          ></span>
          <div className={`pattern-dropdown${this.state.patternDropdown ? ' is-active' : ''}`}>
            <ul>
              <li>users:*</li>
              <li>fh:*</li>
              <li>file-history:*</li>
              <li>logs:*</li>
              <li>users:*</li>
              <li>users:*</li>
              <li>fh:*</li>
              <li>file-history:*</li>
              <li>logs:*</li>
              <li>fh:*</li>
              <li>file-history:*</li>
              <li>logs:*</li>
            </ul>
          </div>
        </div>
        <div className="pattern-table">
          <Table
            rowHeight={30}
            rowGetter={rowGetter.bind(this)}
            rowsCount={this.state.keys.length}
            width={this.state.sidebarWidth}
            height={this.state.windowHeight - 66}
            headerHeight={30}>
            <Column
              label="type"
              width={50}
              dataKey={1}
              cellRenderer={
                cellData => {
                  const type = cellData === 'string' ? 'str' : cellData;
                  return <span className={`key-type ${type}`}>{type}</span>;
                }
              }
            />
            <Column
              label="name"
              width={this.state.sidebarWidth - 50}
              dataKey={0}
            />
          </Table>
        </div>
        <footer className="toolbar toolbar-footer">
        </footer>
      </div>
      <div className="pane">
        <button onClick={() =>
          store.dispatch(action('connect'))
        }>Connect</button>
      </div>
  </SplitPane>;
  }

  componentWillUnmount() {
  }

}

export default Database;
