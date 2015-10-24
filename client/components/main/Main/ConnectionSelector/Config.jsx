'use strict';

import React from 'react';
import store from '../../../../store';
import actions from '../../../../actions';

import {
  PushButton,
  TextField,
  Box,
  SegmentedControl,
  Form,
  Label
} from 'react-desktop';

class Config extends React.Component {
  constructor() {
    super();
    this.state = {
      favorite: null,
      selectedTab: 'standard'
    };
  }

  handleSelectFavorite(favorite) {
    this.setState({ favorite });
  }

  getProp(property) {
    return this.props.favorite ? this.props.favorite.get(property) : '';
  }

  render() {
    const name = this.getProp('name');
    return <div>
      <p>{this.getProp('key')}</p>
    <Box style={ { width: 500, margin: '120px auto 0' } }>
      <SegmentedControl>
        <SegmentedControl.Item
          title="Standard"
          selected={this.state.selectedTab === 'standard'}
          onPress={() => {
            this.setState({ selectedTab: 'standard' });
          } }
          >
          <Form onSubmit={() => {
            store.dispatch(actions('connect'));
          }}>
            <div style={ { display: this.props.favorite ? 'block' : 'none' } }>
              <Form.Row>
                <Label>Name</Label>
                <TextField defaultValue={name} value={name} placeholder="Bookmark name"/>
              </Form.Row>
            </div>
            <Form.Row>
              <Label>Redis Host</Label>
              <TextField defaultValue="" placeholder="localhost"/>
            </Form.Row>
            <Form.Row>
              <Label>Port</Label>
              <TextField defaultValue="" placeholder="6379"/>
            </Form.Row>
            <Form.Row>
              <Label>Password</Label>
              <TextField defaultValue="" placeholder=""/>
            </Form.Row>

            <Form.Row>
              <PushButton onPress={() => {
              }}>Save Changes</PushButton>
            <PushButton onPress="submit" color="blue">Save and Connect</PushButton>
            </Form.Row>
          </Form>
        </SegmentedControl.Item>
        <SegmentedControl.Item
          title="SSH"
          selected={this.state.selectedTab === 'ssh'}
          onPress={() => {
            this.setState({ selectedTab: 'ssh' });
          } }
          >
          <Form onSubmit={() => {
            store.dispatch(actions('connect'));
          }}>
            <Form.Row>
              <Label>Username</Label>
              <TextField defaultValue="" placeholder="Username"/>
            </Form.Row>

            <Form.Row>
              <PushButton onPress={() => {
              }}>Cancel</PushButton>
              <PushButton onPress="submit" color="blue">Submit</PushButton>
            </Form.Row>
          </Form>
        </SegmentedControl.Item>
      </SegmentedControl>
    </Box>
  </div>;
  }
}

export default Config;
