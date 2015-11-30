'use strict';

import React from 'react';
import ConnectionSelector from './ConnectionSelector';
import Database from './Database';
import Modal from '../../common/Modal';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class Main extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    window.showModal = (modal) => {
      this.activeElement = document.activeElement;
      this.setState({ modal });

      return new Promise((resolve, reject) => {
        this.promise = { resolve, reject };
      });
    };
  }

  modalSubmit(result) {
    this.promise.resolve(result);
    this.setState({ modal: null });
    if (this.activeElement) {
      this.activeElement.focus();
    }
  }

  modalCancel() {
    this.promise.reject();
    this.setState({ modal: null });
    if (this.activeElement) {
      this.activeElement.focus();
    }
  }

  componentWillUnmount() {
    delete window.showModal;
  }

  render() {
    const { instances, activeInstanceKey, favorites, patternStore } = this.props;
    const contents = instances.map(instance => {
      return <div
        key={instance.get('key')}
        style={ { display: instance.get('key') === activeInstanceKey ? 'block' : 'none' } }>
        {
          instance.get('redis') ?
            <Database
              redis={instance.get('redis')}
              patternStore={patternStore}
              connectionKey={instance.get('connectionKey')}
            /> :
            <ConnectionSelector
              key={instance.get('key')}
              title={instance.get('host')}
              connectStatus={instance.get('connectStatus')}
              favorites={favorites}
            />
        }
      </div>;
    }).toJS();

    return <div className="main">
      <ReactCSSTransitionGroup transitionName="modal" transitionEnterTimeout={150} transitionLeaveTimeout={150}>
        {
          this.state.modal && <Modal key="modal"
            {...this.state.modal}
            onSubmit={this.modalSubmit.bind(this)}
            onCancel={this.modalCancel.bind(this)}
          />
        }
      </ReactCSSTransitionGroup>
      { contents }
    </div>;
  }
}

export default Main;
