import {handleActions} from 'Utils'
import {
  createPattern,
  removePattern,
  updatePattern,
  reloadPatterns
} from 'Redux/actions'
import {Patterns} from '../../storage'
import {Map, List, fromJS} from 'immutable'

function PatternFactory(data) {
  return Map(Object.assign({value: '*', name: '*'}, data))
}

export const patterns = handleActions(fromJS(Patterns.get()), {
  [createPattern](state, {conn, key}) {
    return state.update(conn, List(), patterns => patterns.push(PatternFactory({key})))
  },
  [removePattern](state, {conn, index}) {
    return state.update(conn, List(), patterns => patterns.remove(index))
  },
  [updatePattern](state, {conn, index, data}) {
    return state.update(conn, List(), patterns => patterns.update(index, item => item.merge(data)))
  },
  // [reorderPatterns](state, {conn, from, to}) {
  //   return state.update(conn, List(), patterns => {
  //     const target = patterns.get(from);
  //     return patterns.splice(from, 1).splice(to, 0, target);
  //   })
  // },
  [reloadPatterns](state, data) {
    return fromJS(data)
  }
})
