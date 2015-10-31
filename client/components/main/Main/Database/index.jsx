'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import store from '../../../../store';
import action from '../../../../actions';
import { Table, Column } from 'fixed-data-table';
import SplitPane from 'react-split-pane';
import PatternList from './PatternList';

class Database extends React.Component {
  constructor() {
    super();
    this.state = {
      keys: [],
      selectedKey: null,
      sidebarWidth: 300,
      cursor: 0
    };
  }

  componentDidMount() {
    const redis = this.props.redis;

    redis.scan('0', 'MATCH', '*', 'COUNT', '20000', (_, res) => {
      Promise.all(res[1].map(key => {
        return Promise.all([key, redis.type(key)]);
      })).then(keys => {
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

    this.setState({ dropdownHeight: node.clientHeight - 66 });
  }

  handleSelectPattern() {
  }

  render() {
    function rowGetter(rowIndex) {
      return this.state.keys[rowIndex] || [];
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
        <PatternList
          patterns={ this.props.patterns }
          height={ this.dropdownHeight }
        />
        <div className="pattern-table">
          <Table
            rowHeight={24}
            rowGetter={rowGetter.bind(this)}
            rowsCount={this.state.keys.length + 1}
            rowClassNameGetter={index => {
              const item = this.state.keys[index];
              if (!item) {
                return 'is-loading';
              }
              if (item[0] === this.state.selectedKey) {
                return 'is-selected';
              }
              return '';
            }}
            onRowClick={(evt, index) => {
              const item = this.state.keys[index];
              if (item && item[0]) {
                this.setState({ selectedKey: item[0] });
              }
            }}
            width={this.state.sidebarWidth}
            height={this.state.windowHeight - 66}
            headerHeight={24}
          >
            <Column
              label="type"
              width={40}
              dataKey={1}
              cellRenderer={
                cellData => {
                  if (!cellData) {
                    return '';
                  }
                  const type = cellData === 'string' ? 'str' : cellData;
                  return <span className={`key-type ${type}`}>{type}</span>;
                }
              }
            />
            <Column
              label="name"
              width={this.state.sidebarWidth - 50}
              dataKey={0}
              cellRenderer={
                cellData => {
                  if (!cellData) {
                    return 'Scanning...';
                  }
                  return cellData;
                }
              }
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
}

export default Database;
