import React from 'react';
import ReactDOM from 'react-dom';
import {createSelector} from 'reselect';
import {connect} from 'react-redux';
import {addPattern, reorderPatterns, updatePattern, removePattern} from 'Redux/actions';
import Sortable from 'sortablejs';

require('./app.scss');

const connectionKey = getParameterByName('arg');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indexKey: 'init'
    };
    this._updateSortableKey();
  }

  _updateSortableKey() {
    this.sortableKey = `sortable-${Math.round(Math.random() * 10000)}`;
  }

  _bindSortable() {
    this.sortable = Sortable.create(this.refs.sortable, {
      animation: 100,
      onStart: evt => {
        this.nextSibling = evt.item.nextElementSibling;
      },
      onAdd: () => {
        this._updateSortableKey();
      },
      onUpdate: evt => {
        this._updateSortableKey();
        this.props.reorderPatterns({
          conn: connectionKey,
          from: evt.oldIndex,
          to: evt.newIndex
        })
      }
    });
  }

  handleChange(property, e) {
    this.setState({ [property]: e.target.value });
  }

  componentDidMount() {
    this._bindSortable();
    if (this.props.patterns.length) {
      this.select(this.props.patterns[0]);
    }
  }

  componentDidUpdate() {
    this._bindSortable();
  }

  onClick(index, evt) {
    evt.preventDefault();
    this.select(this.props.patterns[index]);
  }

  select(pattern) {
    this.setState({
      activeKey: pattern && pattern.key,
      indexKey: 'index' + Math.round(Math.random() * 1000),
      name: pattern && pattern.name,
      value: pattern && pattern.value
    });
  }

  getActivePattern() {
    let activePattern;
    let activeIndex;
    for (let i = 0; i < this.props.patterns.length; i++) {
      if (this.props.patterns[i].key === this.state.activeKey) {
        activePattern = this.props.patterns[i];
        activeIndex = i;
        break;
      }
    }

    return [activeIndex, activePattern];
  }

  render() {
    const [activeIndex, activePattern] = this.getActivePattern();

    return <div className="window">
      <div className="patternList">
        <div ref="sortable" key={this.sortableKey}>{
          this.props.patterns.map((pattern, index) => {
            return <a
              key={pattern.key}
              className={'nav-group-item' + (pattern.key === this.state.activeKey ? ' is-active' : '')}
              onClick={this.onClick.bind(this, index)}
            >
              <span>{pattern.name}</span>
            </a>;
          })
        }</div>
        <footer>
          <button
            onClick={() => {
              this.props.addPattern({conn: connectionKey})
              // TODO: auto select
              // this.select(pattern.toJS());
            }}
          >+</button>
          <button
            className={activePattern ? '' : 'is-disabled'}
            onClick={() => {
              if (activePattern) {
                this.props.removePattern({ conn: connectionKey, key: activePattern.key })
                if (activeIndex >= 1) {
                  this.select(this.props.patterns[activeIndex - 1]);
                } else if (this.props.patterns.length > 1) {
                  this.select(this.props.patterns[1]);
                } else {
                  this.select(null);
                }
              }
            }}
          >-</button>
        </footer>
      </div>
      <div
        key={this.state.indexKey}
        className="form nt-box"
        style={ { display: activePattern ? 'block' : 'none' } }
      >
        <div className="nt-form-row nt-form-row--vertical">
          <label htmlFor="name">Name:</label>
          <input
            type="text" id="name"
            readOnly={activePattern ? false : true }
            value={this.state.name}
            onChange={this.handleChange.bind(this, 'name')}
          />
        </div>
        <div className="nt-form-row nt-form-row--vertical">
          <label htmlFor="value">Pattern:</label>
          <input
            type="text" id="value"
            readOnly={activePattern ? false : true }
            value={this.state.value}
            onChange={this.handleChange.bind(this, 'value')}
          />
        </div>
        <div className="nt-button-group nt-button-group--pull-right" style={ { margin: '10px auto 0' } }>
          <button
            className="nt-button nt-button--primary"
            onClick={() => {
              this.props.updatePattern({
                conn: connectionKey,
                index: activeIndex,
                data: { name: this.state.name, value: this.state.value }
              })
              alert('Save Successfully');
            }}
          >Save</button>
        </div>
      </div>
    </div>;
  }
}

const selector = createSelector(
  state => state.patterns,
  (patterns) => {
    return { patterns: patterns.get(connectionKey, List()).toJS() };
  }
)

const mapDispatchToProps = {
  updatePattern,
  reorderPatterns,
  addPattern,
  removePattern
}

export default connect(selector)(App);

function getParameterByName(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}
