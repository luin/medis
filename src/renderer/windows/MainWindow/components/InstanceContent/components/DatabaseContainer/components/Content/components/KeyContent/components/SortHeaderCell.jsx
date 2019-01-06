'use strict'

import React, {PureComponent} from 'react'
import {Cell} from 'fixed-data-table-contextmenu'

export default class SortHeaderCell extends PureComponent {
  handleClick(evt) {
    this.props.onOrderChange(!this.props.desc)
    evt.preventDefault()
    evt.stopPropagation()
  }

  render() {
    return (<Cell
      onClick={this.handleClick.bind(this)}
      >
      <a
        className={'SortHeaderCell' + (this.props.desc ? '' : ' is-asc')}
        >
        {this.props.title}
        {
          <img
            onClick={this.handleClick.bind(this)}
            width="7"
            height="4"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAJBAMAAADwYwBaAAAAKlBMVEUAAACfn5/t7e2lpaXAwMD9/f3x8fHGxsapqan4+Pj19fWrq6uhoaG+vr4IBCNyAAAAAXRSTlMAQObYZgAAAERJREFUCNdjmMUAAisZDl4FUiEyDBtFAhhYHaUZMgQdGFgE2xjYGsUZCiUSGBiUBcsFjYBqmAwFhRVAepRBXJCAMZALALm5CbsZPOUxAAAAAElFTkSuQmCC"
            />
        }
      </a>
    </Cell>)
  }
}
