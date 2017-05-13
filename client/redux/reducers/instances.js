import {handleActions} from 'Utils'
import {
  createInstance,
  moveInstance,
  delInstance,
  updateConnectStatus,
  connectToRedis,
  disconnect
} from 'Redux/actions'
import {Map, List} from 'immutable'
import {defaultInstanceKey} from './activeInstanceKey'

function InstanceFactory({key, data}) {
  return Map(Object.assign({key, title: 'Medis'}, data))
}

export const instances = handleActions(List([InstanceFactory({key: defaultInstanceKey})]), {
  [createInstance](state, data) {
    return state.push(InstanceFactory({data}))
  },
  [moveInstance](state, {fromIndex, toIndex}) {
    const instance = state.get(fromIndex)
    return state.splice(fromIndex, 1).splice(toIndex, 0, instance)
  },
  [delInstance](state, {targetIndex}) {
    return state.remove(targetIndex)
  },
  [updateConnectStatus](state, {index, status}) {
    return state.setIn([index, 'connectStatus'], status)
  },
  [disconnect](state, {index}) {
    const properties = ['connectStatus', 'redis', 'config', 'version']
    return state.update(index, instance => (
      instance.withMutations(map => {
        properties.forEach(key => map.remove(key))
        map.set('title', 'Medis')
      })
    ))
  },
  [connectToRedis](state, {index, config, redis}) {
    const {name, sshHost, host, port} = config
    const remote = name ? `${name}/` : (sshHost ? `${sshHost}/` : '')
    const address = `${host}:${port}`
    const title = `${remote}${address}`
    const connectionKey = `${sshHost || ''}|${host}|${port}`
    const version = redis.serverInfo && redis.serverInfo.redis_version

    return state.update(index, instance => (
      instance.merge({config, title, redis, version, connectionKey}).remove('connectStatus')
    ))
  }
})
