'use strict';

import ipc from 'ipc';
import React from 'react';
import ReactDOM from 'react-dom';
import store from '../../../../store';
import action from '../../../../actions';
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

    $('.js-pattern-dropdown.pattern-dropdown').height(node.clientHeight - 66);
  }

  handleSelectPattern() {
  }

  render() {
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
            className="js-pattern-dropdown icon icon-down-open"
            onClick={() => {
              $('.js-pattern-dropdown').toggleClass('is-active');
            }}
          ></span>
          <div className="js-pattern-dropdown pattern-dropdown">
            <ul>
              {
                this.props.patterns.map(pattern => {
                  return <li>{pattern.get('name')}</li>;
                })
              }
              <li
                className="manage-pattern-button"
                onClick={() => {
                  ipc.send('create pattern-manager', this.props.connectionKey);
                }}
              >
                <span className="icon icon-cog"></span>
                Manage Patterns...
              </li>
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
            headerHeight={30}
            footerDataGetter={
              () => {
                return <p>Load more...</p>;
              }
            }
            footerHeight={20}
          >
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
