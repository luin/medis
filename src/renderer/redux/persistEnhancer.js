import * as Storage from '../storage'

const whiteList = [
  {key: 'patterns', storage: 'Patterns'},
  {key: 'favorites', storage: 'Favorites'},
  {key: 'sizes', storage: 'Sizes'}
]

export default function (store) {
  let lastState
  store.subscribe(() => {
    if (store.skipPersist) {
      return
    }
    const state = store.getState()
    whiteList.forEach(({key, storage}) => {
      const value = state[key]
      if (!lastState || value !== lastState[key]) {
        Storage[storage].set(value)
      }
    })

    lastState = state
  })
}
