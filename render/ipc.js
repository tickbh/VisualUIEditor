'use strict'

/**
 * @module Ipc
 */
let Ipc = {}
module.exports = Ipc

Ipc.sendToAll = function (message, ...args) {
  if (typeof message !== 'string') {
    Console.error('Call to `sendToAll` failed. The message must be a string.')
    return
  }

  args = [null, message, ...args]
  _render2all.apply(null, args)
}

Ipc.sendToAllPanel = function (message, ...args) {
  if (typeof message !== 'string') {
    Console.error('Call to `sendToAllPanel` failed. The message must be a string.')
    return
  }

  args = [null, message, ...args]
  _render2allpanel.apply(null, args)
}

Ipc.sendToMain = function (message, ...args) {
  args = ['ipc-render2main', message, ...args]
  ipcRenderer.send.apply(ipcRenderer, args)
}

Ipc.sendToMainDirect = function (message, ...args) {
  args = [message, ...args]
  ipcRenderer.send.apply(ipcRenderer, args)
}

ipcRenderer.on('ipc-renderer2all', _render2all)

ipcRenderer.on('ipc-renderer2allpanel', _render2allpanel)

function _render2all (event, message, ...args) {
  let oneArgs = [...args]
  let docker = global.myDocker
  if (!docker) {
    return
  }
  let frameList = docker._frameList
  for (var i = 0; i < frameList.length; ++i) {
    let panels = frameList[i]._panelList
    for (var a = 0; a < panels.length; ++a) {
      var main = panels[a]._main
      if (main) {
        let msg = main.messages || {}
        let fn = msg[message]
        if (typeof fn === 'function') {
          fn.call(main, message, ...args)
          continue
        }
        main.dispatchEvent(new window.CustomEvent(message, args))
      }
    }
  }
}

function _render2allpanel (event, message, ...args) {
  let oneArgs = [...args]
  let docker = global.myDocker
  if (!docker) {
    return
  }
  let frameList = docker._frameList
  for (var i = 0; i < frameList.length; ++i) {
    let panels = frameList[i]._panelList
    for (var a = 0; a < panels.length; ++a) {
      var panel = panels[a]
      let msg = panel.messages || {}
      let fn = msg[message]
      if (typeof fn === 'function') {
        fn.call(panel, message, ...args)
        continue
      }
    }
  }
}
