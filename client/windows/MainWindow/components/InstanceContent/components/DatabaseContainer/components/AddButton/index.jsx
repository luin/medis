import React from 'react'

require('./index.scss')

export default class AddButton extends React.PureComponent {
  render() {
    return (<div className="AddButton">
      {this.props.title}
      {
        this.props.reload && <span className="reload icon icon-cw" onClick={this.props.onReload}/>
      }
      <span className="plus" onClick={this.props.onClick}>+</span>
    </div>)
  }
}
