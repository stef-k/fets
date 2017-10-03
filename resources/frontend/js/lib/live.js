/**
 * Live handles incoming messages by mapping them to respective methods
 */
class Live {
  /**
   * The websocket client instance handling the incoming ws messages
   * @param {GMap} map - Google map instance
   */
  constructor (map = {}, soundManager = null) {
    this.map = map
    this.soundManager = soundManager
    this.dev = window.app.env === 'development'
  }

  /**
   *
   * @param {message} message the incoming object
   */
  handle (message) {
    if ('type' in message) {
      if (message.type === 'message') {
        if ('message' in message) {
          this.handleMessage(message.message)
        }
      } else if (message.type === 'action') {
        if ('message' in message) {
          this.handleAction(message.message)
        }
      }
    }
  }

  /**
   * Handles an incoming alert notification
   * @param {*} message
   */
  handleMessage (message) {
    this.map.addMarker(message)
    this.soundManager.play()
  }

  /**
   * Fires various actions through a websocket
   * @param {*} action
   */
  handleAction (action) {
    if (action.text === 'alert deleted') {
      this.map.deleteMarker(action.data)
    }
    if (action.text === 'alert verified' || action.text === 'alert unverified' || action.text === 'alert comments changed') {
      this.map.modifyAlert(action.text, action.data)
    }
  }
}

export { Live }
