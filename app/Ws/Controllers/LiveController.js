'use strict'

class LiveController {
  constructor (socket, request) {
    this.socket = socket
    this.request = request
  }
}

module.exports = LiveController
