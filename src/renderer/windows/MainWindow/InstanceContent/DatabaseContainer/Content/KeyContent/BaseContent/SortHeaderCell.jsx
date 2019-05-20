'use strict'

import React, {memo} from 'react'
import {Cell} from 'fixed-data-table-contextmenu'

function SortHeaderCell({onOrderChange, desc, title}) {
  function handleOnClick(evt) {
    onOrderChange(!desc)
    evt.preventDefault()
    evt.stopPropagation()
  }

  return (<Cell
    onClick={handleOnClick}
    >
    <a className={'SortHeaderCell' + (desc ? '' : ' is-asc')}>
      {title}
      {
        <img
          width="7"
          height="4"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAJBAMAAADwYwBaAAAAKlBMVEUAAACfn5/t7e2lpaXAwMD9/f3x8fHGxsapqan4+Pj19fWrq6uhoaG+vr4IBCNyAAAAAXRSTlMAQObYZgAAAERJREFUCNdjmMUAAisZDl4FUiEyDBtFAhhYHaUZMgQdGFgE2xjYGsUZCiUSGBiUBcsFjYBqmAwFhRVAepRBXJCAMZALALm5CbsZPOUxAAAAAElFTkSuQmCC"
        />
      }
    </a>
  </Cell>)
}

export default memo(SortHeaderCell)
