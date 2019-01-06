import {handleActions} from 'Utils'
import {
  setSize
} from 'Redux/actions'
import {Sizes} from '../../storage'
import {Map, List, fromJS} from 'immutable'

export const sizes = handleActions(fromJS(Sizes.get()), {
  [setSize](state, {type, value}) {
    return state.set(`${type}BarWidth`, value)
  }
})
