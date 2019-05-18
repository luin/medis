import React, {memo} from 'react'

require('./index.scss')

function AddButton({title, reload, onReload, onClick}) {
  return (<div className="AddButton">
    {title}
    {reload && <span className="reload icon icon-cw" onClick={onReload} />}
    <span className="plus" onClick={onClick}>+</span>
  </div>)
}

export default memo(AddButton)
