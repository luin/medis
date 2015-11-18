'use strict';

import React from 'react';
import { Cell } from 'fixed-data-table';

export default class SortHeaderCell extends React.Component {
  render() {
    return <Cell>
      <a className={"SortHeaderCell" + (this.props.desc ? '' : ' is-asc')} onClick={() => this.props.onOrderChange(!this.props.desc) }>
        {this.props.title}
        {
          <img
            width='7'
            height='4'
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAJBAMAAADwYwBaAAAAKlBMVEUAAACfn5/t7e2lpaXAwMD9/f3x8fHGxsapqan4+Pj19fWrq6uhoaG+vr4IBCNyAAAAAXRSTlMAQObYZgAAAERJREFUCNdjmMUAAisZDl4FUiEyDBtFAhhYHaUZMgQdGFgE2xjYGsUZCiUSGBiUBcsFjYBqmAwFhRVAepRBXJCAMZALALm5CbsZPOUxAAAAAElFTkSuQmCC" />
        }
      </a>
    </Cell>;
  }
}
