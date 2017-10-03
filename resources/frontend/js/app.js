import {GMap} from './lib/gmap'
import {Live} from './lib/live'
import {Login} from './lib/login'
import {SoundManager} from './lib/sound-manager'
window.$ = require('jquery')

const ws = require('adonis-websocket-client')
const io = ws('')
const chan = io.channel('live').connect()

const setupCsrf = function () {
  $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    jqXHR.setRequestHeader('csrf-token', $('input[name=_csrf]').val())
  })
}

const main = function () {
  const googleKey = window.app.gmapsKey
  let soundManager = new SoundManager()
  let gmap = new GMap('map', 38.7, 25, 7, soundManager, googleKey)
  let login = new Login()
  let live = new Live(gmap, soundManager)
  chan.on('message', (message) => {
    live.handle(message)
  })
  setupCsrf()
}

$(document).ready(() => {
  main()
})
