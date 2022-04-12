import io from 'socket.io-client'
import Vue from 'vue'

export default function({
  app,
  $axios,
  store,
  route
}, inject) {
  let socket

  const init = async(token) => {
    try {
      if (socket) {
        socket.disconnect()
      }
      const url = new URL($axios.defaults.baseURL, window.location.href.split(/[?#]/)[0]).href
      socket = io(url, {
        extraHeaders: { 'xc-auth': token }
      })

      socket.on('connect_error', () => {
        socket.disconnect()
        socket = null
      })
    } catch { }
  }

  app.router.onReady(() => {
    app.router.afterEach(function(to, from) {
      if (!socket || (to.path === from.path && (to.query && to.query.type) === (from.query && from.query.type))) {
        return
      }
      socket.emit('page', {
        id: store.state.users.user && store.state.users.user.id,
        path: to.matched[0].path + (to.query && to.query.type ? `?type=${to.query.type}` : '')
      })
    })
    if (socket) {
      socket.emit('page', {
        id: store.state.users.user && store.state.users.user.id,
        path: route.matched[0].path + (route.query && route.query.type ? `?type=${route.query.type}` : '')
      })
    }
  })

  const tele = {
    emit(evt, data) {
      if (socket) {
        socket.emit('event', {
          event: evt,
          id: store.state.users.user && store.state.users.user.id,
          ...(data || {}),
          $current_url: gatPath(app)
        })
      }
    }
  }

  inject('tele', tele)

  function getListener(binding) {
    return function(e) {
      if (!socket) { return }
      const cat = window.location.hash.replace(/\d+\/(?=dashboard)/, '')
      const event = binding.value && binding.value[0]
      const data = binding.value && binding.value[1]
      const extra = binding.value && binding.value.slice(2)
      tele.emit(event,
        {
          cat,
          data,
          extra
        })
    }
  }

  Vue.directive('t', {
    bind(el, binding, vnode) {
      if (vnode.componentInstance) {
        vnode.componentInstance.$on('click', getListener(binding))
      } else {
        el.addEventListener('click', getListener(binding))
      }
    }
  })

  store.watch(state => state.project.projectInfo && state.project.projectInfo.teleEnabled && state.users.token, (token) => {
    if (token) {
      init(token).then(() => {})
    } else if (socket) {
      socket.disconnect()
      socket = null
    }
  })
  if (store.state.project.projectInfo && store.state.project.projectInfo.teleEnabled && store.state.users.token) {
    init(store.state.users.token).then(() => {})
  }
}

function gatPath(app) {
  return app && app.router && app.router.app && app.router.app.$route && app.router.app.$route.matched && app.router.app.$route.matched[0] && app.router.app.$route.matched[0].path
}
