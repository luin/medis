'use strict';

import _ from 'lodash';
import React from 'react/addons';
import invariant from 'react/lib/invariant';
import Draggable from 'react-draggable';
import Mousetrap from 'mousetrap';

import TabTemplate from './TabTemplate';
import CloseIcon from './CloseIcon';

import Utils from '../helpers/utils';

class Tabs extends React.Component {
  constructor(props) {
    super(props);

    const defaultState = this._tabStateFromProps(this.props);
    defaultState.selectedTab = this.props.selectedTab ? this.props.selectedTab :
                                                        this.props.tabs ? this.props.tabs[0].key : '';
    this.state = defaultState;

    // Dom positons
    // do not save in state
    this.startPositions = [];
  }

  _tabStateFromProps(props) {
    const tabs = [];
    let idx = 0;
    React.Children.forEach(props.tabs, (tab) => {

      invariant(
        tab.key,
        'There should be unique key in each Tab'
      );

      tabs[idx] = tab;
      idx++;
    });

    return { tabs };
  }

  _getIndexOfTabByKey(key) {
    return _.findIndex(this.state.tabs, (tab) => {
      return tab.key === key;
    });
  }

  _getTabByKey(key) {
    return _.where(this.state.tabs, (tab) => {
      return tab.key === key;
    });
  }

  _getNextTabKey(key) {
    let nextKey;
    const current = this._getIndexOfTabByKey(key);
    if (current + 1 < this.state.tabs.length) {
      nextKey = this.state.tabs[current + 1].key;
    }
    return nextKey;
  }

  _getPrevTabKey(key) {
    let prevKey;
    const current = this._getIndexOfTabByKey(key);
    if (current > 0) {
      prevKey = this.state.tabs[current - 1].key;
    }
    return prevKey;
  }

  _moveTabPosition(key1, key2) {
    const t1 = this._getIndexOfTabByKey(key1);
    const t2 = this._getIndexOfTabByKey(key2);
    return Utils.slideArray(this.state.tabs, t1, t2);
  }

  _saveStartPositions() {
    const positions = _.map(this.state.tabs, (tab) => {
      const el = React.findDOMNode(this.refs[tab.key]);
      const pos = el ? el.getBoundingClientRect() : {};
      return { key: tab.key, pos };
    });
    // Do not save in state
    this.startPositions = positions;
  }

  _cancelEventSafety(e) {
    if (typeof e.preventDefault !== 'function') {
      e.preventDefault = () => {};
    }
    if (typeof e.stopPropagation !== 'function') {
      e.stopPropagation = () => {};
    }
    e.preventDefault();
    e.stopPropagation();
    return e;
  }

  componentWillMount() {
  }

  componentDidMount() {
    this._saveStartPositions();
    this.bindShortcuts();
  }

  componentWillUnmount() {
    this.unbindShortcuts();
  }

  componentWillReceiveProps(nextProps) {
    const newState = this._tabStateFromProps(nextProps);
    if (nextProps.selectedTab !== 'undefined') {
      newState.selectedTab = nextProps.selectedTab;
    }
    // reset closedTabs, respect props from application
    this.setState(newState);
  }

  componentWillUpdate() {
  }

  componentDidUpdate() {
    this._saveStartPositions();
  }

  bindShortcuts() {
    if (this.props.shortCutKeys) {
      if (this.props.shortCutKeys.close) {
        Mousetrap.bind(this.props.shortCutKeys.close, (e) => {
          e = this._cancelEventSafety(e);
          if (this.state.selectedTab) {
            this.handleCloseButtonClick(this.state.selectedTab, e);
          }
        });
      }
      if (this.props.shortCutKeys.create) {
        Mousetrap.bind(this.props.shortCutKeys.create, (e) => {
          e = this._cancelEventSafety(e);
          this.handleAddButtonClick(e);
        });
      }
      if (this.props.shortCutKeys.moveRight) {
        Mousetrap.bind(this.props.shortCutKeys.moveRight, (e) => {
          e = this._cancelEventSafety(e);
          this.moveRight(e);
        });
      }
      if (this.props.shortCutKeys.moveLeft) {
        Mousetrap.bind(this.props.shortCutKeys.moveLeft, (e) => {
          e = this._cancelEventSafety(e);
          this.moveLeft(e);
        });
      }
    }
  }

  unbindShortcuts() {
    Mousetrap.reset();
  }

  handleMouseDown() {}

  handleDragStart() {}

  handleDrag(key, e) {
    const deltaX = (e.pageX || e.clientX);
    _.each(this.startPositions, (pos) => {
      const tempMoved = pos.moved || 0;
      const shoudBeSwap = key !== pos.key && pos.pos.left + tempMoved < deltaX && deltaX < pos.pos.right + tempMoved;
      if (shoudBeSwap) {
        const el = React.findDOMNode(this.refs[pos.key]);
        const idx1 = this._getIndexOfTabByKey(key);
        const idx2 = this._getIndexOfTabByKey(pos.key);
        const minus = idx1 > idx2 ? 1 : -1;
        const movePx = (minus * (pos.pos.right - pos.pos.left)) - tempMoved;
        el.style.transform = `translate(${movePx}px, 0px)`;
        this.startPositions[idx2].moved = movePx;
      }
    });
  }

  handleDragStop(key, e) {
    const deltaX = (e.pageX || e.clientX);
    let swapedTabs;
    const newState = {};
    _.each(this.startPositions, (pos) => {
      const shoudBeSwap = key !== pos.key && pos.pos.left < deltaX && deltaX < pos.pos.right;
      if (shoudBeSwap) {
        swapedTabs = this._moveTabPosition(key, pos.key);
      }
      const el = React.findDOMNode(this.refs[pos.key]);
      el.style.transform = 'translate(0px, 0px)';
    });
    const nextTabs = swapedTabs || this.state.tabs;

    newState.tabs = nextTabs;
    newState.selectedTab = key;
    this.setState(newState, () => {
      if(swapedTabs) {
        this.props.onTabPositionChange(e, key, this.state.tabs);
      }
    });
  }

  handleTabClick(key, e) {
    const classes = e.target.className.split(' ');
    if (classes.indexOf('rdTabCloseIcon') > -1) {
      e = this._cancelEventSafety(e);
    } else {
      this.setState({ selectedTab: key }, () => {
        this.props.onTabSelect(e, key, this.state.tabs);
      });
    }
  }

  handleCloseButtonClick(key, e) {
    e = this._cancelEventSafety(e);
    let nextSelected;

    if (this.state.selectedTab === key) {
      nextSelected = this._getNextTabKey(key);
      if (!nextSelected) {
        nextSelected = this._getPrevTabKey(key);
      }
    } else {
      nextSelected = this.state.selectedTab;
    }

    const shoudBeNotifyTabChange = this.state.selectedTab !== nextSelected;
    this.setState({
      selectedTab: nextSelected
    }, () => {
      this.props.onTabClose(e, key);
      if (shoudBeNotifyTabChange) {
        this.props.onTabSelect(e, nextSelected);
      }
    });
  }

  handleAddButtonClick(e) {
    this.props.onTabAddButtonClick(e);
  }

  moveRight(e) {
    let nextSelected = this._getNextTabKey(this.state.selectedTab);
    if (!nextSelected) {
      nextSelected = this.props.tabs[0] ? this.props.tabs[0].key : '';
    }
    if (nextSelected !== this.state.selectedTab) {
      this.setState({ selectedTab: nextSelected }, () => {
        this.props.onTabSelect(e, nextSelected);
      });
    }
  }

  moveLeft(e) {
    let nextSelected = this._getPrevTabKey(this.state.selectedTab);
    if (!nextSelected) {
      nextSelected = _.last(this.props.tabs) ? _.last(this.props.tabs).key : '';
    }
    if (nextSelected !== this.state.selectedTab) {
      this.setState({ selectedTab: nextSelected }, () => {
        this.props.onTabSelect(e, nextSelected);
      });
    }
  }

  getCloseButton(tab) {
    if (tab.props.disableClose) {
      return '';
    }
    return (<CloseIcon onClick={this.handleCloseButtonClick.bind(this, tab.key)}>&times;</CloseIcon>);
  }

  doubleClickHandlerWithKey(key) {
    return e => {
      this.props.onTabDoubleClick(e, key);
    };
  }

  render() {
    const content = [];
    const tabs = _.map(this.state.tabs, (tab) => {

      if (this.state.selectedTab === tab.key) {
        content.push(<TabTemplate key={'tabTemplate#' + tab.key} selected={true}>{tab}</TabTemplate>);
      } else {
        content.push(<TabTemplate key={'tabTemplate#' + tab.key} selected={false}>{tab}</TabTemplate>);
      }

      const tabTitle = tab.props.title;
      const closeButton = this.getCloseButton(tab);

      return (
        <Draggable
          key={'draggable_tabs_' + tab.key }
          axis='x'
          cancel='.rdTabCloseIcon'
          start={{ x: 0, y: 0 }}
          moveOnStartChange={true}
          zIndex={100}
          bounds='parent'
          onStart={this.handleDragStart.bind(this, tab.key)}
          onDrag={this.handleDrag.bind(this, tab.key)}
          onStop={this.handleDragStop.bind(this, tab.key)}>
          <li
              onClick={this.handleTabClick.bind(this, tab.key)}
              onMouseDown={this.handleMouseDown.bind(this, tab.key)}
              className={this.state.selectedTab === tab.key ? 'is-active' : '' }
              ref={tab.key}>
            <p onDoubleClick={this.doubleClickHandlerWithKey(tab.key)}>{tabTitle}</p>
            {closeButton}
          </li>
        </Draggable>
      );
    });

    return (
      <div>
        <ul className="instance-tabs" tabIndex='-1'>
          {tabs}
          <li className='instance-tabs__add' onClick={this.handleAddButtonClick.bind(this)}>
            {this.props.tabAddButton}
          </li>
        </ul>
        <div className="main">
          {content}
        </div>
      </div>
    );
  }
}

Tabs.defaultProps = {
  tabsClassNames: {
    tabBar: '',
    tabBarAfter: '',
    tab: '',
    tabBefore: '',
    tabAfter: '',
    tabBeforeTitle: '',
    tabTitle: '',
    tabAfterTitle: '',
    tabCloseIcon: '',
    tabActive: ''
  },
  tabsStyles: {},
  shortCutKeys: {},
  tabAddButton: (<span>{'+'}</span>),
  onTabSelect: () => {},
  onTabClose: () => {},
  onTabAddButtonClick: () => {},
  onTabPositionChange: () => {},
  onTabDoubleClick: () => {}
};

Tabs.propTypes = {
  tabs: React.PropTypes.arrayOf(React.PropTypes.element),

  selectedTab: React.PropTypes.string,
  tabAddButton: React.PropTypes.element,
  onTabSelect: React.PropTypes.func,
  onTabClose: React.PropTypes.func,
  onTabAddButtonClick: React.PropTypes.func,
  onTabPositionChange: React.PropTypes.func,
  onTabDoubleClick: React.PropTypes.func

};

export default Tabs;
