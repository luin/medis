import {handleActions} from 'Utils'
import {
  createPattern,
  removePattern,
  updatePattern,
  reorderPatterns,
  reloadPatterns
} from 'Redux/actions'
import {Patterns} from '../../storage'
import {Map, List, fromJS} from 'immutable'

function PatternFactory(data) {
  return Map(Object.assign({value: '*', name: '*'}, data))
}

export const patterns = handleActions(fromJS(Patterns.get()), {
  [createPattern](state, {conn, data}) {
    return state.update(conn, List(), patterns => patterns.push(PatternFactory(data)))
  },
  [removePattern](state, {conn, key}) {
    return state.update(conn, List(), patterns => patterns.filterNot(item => item.get('key') === key))
  },
  [updatePattern](state, {conn, key, data}) {
    return state.update(conn, List(), patterns => patterns.map(item => item.get('key') === key ? item.merge(data) : item))
  },
  [reorderPatterns](state, {conn, from, to}) {
    return state.update(conn, List(), patterns => {
      const target = patterns.get(from);
      return patterns.splice(from, 1).splice(to, 0, target);
    })
  },
  [reloadPatterns](state, data) {
    return fromJS(data)
  }
})
