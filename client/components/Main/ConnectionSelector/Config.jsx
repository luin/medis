'use strict';

import React from 'react';
import store from '../../../store';
import actions from '../../../actions';

import {
  Window,
  TitleBar,
  PushButton,
  TextField,
  Toolbar,
  Box,
  SegmentedControl,
  IndeterminateCircularProgressIndicator,
  Form,
  Label
} from 'react-desktop';

class Config extends React.Component {
  constructor() {
    super();
    this.state = {
      favorite: null,
      selectedTab: 'login'
    };
  }

  handleSelectFavorite(favorite) {
    this.setState({ favorite });
  }

  getProp(property) {
    return this.props.favorite ? this.props.favorite.get(property) : '';
  }

  render() {
    return <div>
      <p>{this.getProp('key')}</p>
      <button onClick={() =>
        store.dispatch(actions('connect'))
      }>Connect</button>
    <Box>
      <SegmentedControl>
        <SegmentedControl.Item
          title="Login"
          selected={this.state.selectedTab === 'login'}
          onPress={() => {
            this.setState({ selectedTab: 'login' });
          } }
          >
          <Form onSubmit={() => {
            alert('submit');
          }}>
            <Label color="red">Error</Label>

            <Form.Row>
              <Label>Username</Label>
              <TextField defaultValue="" placeholder="Username"/>
            </Form.Row>

            <Form.Row>
              <PushButton onPress={() => {
                alert('cancel');
              }}>Cancel</PushButton>
              <PushButton onPress="submit" color="blue">Submit</PushButton>

              <IndeterminateCircularProgressIndicator visible absolute/>
            </Form.Row>
          </Form>
        </SegmentedControl.Item>
      </SegmentedControl>
    </Box>
  </div>;
  }
}

export default Config;
