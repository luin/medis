import {handleActions} from 'Utils'
import {
  createInstance,
  selectInstance,
  moveInstance,
  delInstance
} from 'Redux/actions'

export const defaultInstanceKey = 'FIRST_INSTANCE'

export const activeInstanceKey = handleActions(defaultInstanceKey, {
  [createInstance](state, data) {
    return data.key
  },
  [selectInstance](state, data) {
    return data
  },
  [moveInstance](state, {activeInstanceKey}) {
    return activeInstanceKey
  },
  [delInstance](state, {activeInstanceKey}) {
    console.log('==delInstance', activeInstanceKey)
    return activeInstanceKey
  }
})
