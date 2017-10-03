'use strict'
const ws = use('Ws')
const Alert = use('App/Model/Alert')

class AlertController {
  /**
   * Return all alerts from database
   * @param {*} request
   * @param {*} response
   */
  * show (request, response) {
    let alerts = yield Alert.all()
    response.ok(alerts.toJSON())
  }

  /**
   * Create a new alert notification object
   * @param {*} request
   * @param {*} response
   */
  * create (request, response) {
    let data = request.only('phonenumber', 'lat', 'lon')
    let alert = new Alert(data)
    yield alert.save()
    alert = yield Alert.findBy('id', alert.id)
    // pass the incoming data to the websocket
    ws.channel('live').emit('message', {
      type: 'message',
      message: alert
    })
    return response.status(201).send('alert created')
  }

  /**
   * Delete an alert notification object from the database
   * @param {*} request
   * @param {*} response
   */
  * delete (request, response) {
    const id = request.param('id')
    const alert = yield Alert.findBy('id', id)
    let message = {
      text: 'alert deleted',
      data: alert
    }
    yield alert.delete()
    // pass the action and it's data to the websocket
    ws.channel('live').emit('message', {
      type: 'action',
      message: message
    })
    return response.status(200).send('alert deleted')
  }

  /**
   * Toggles alert verification attribute
   * @param {*} request
   * @param {*} response
   */
  * verify (request, response) {
    const id = request.param('id')
    const alert = yield Alert.findBy('id', id)
    let message = {
      text: '',
      data: alert
    }
    if (alert.verified === 0) {
      alert.verified = 1
      message.text = 'alert verified'
    } else {
      message.text = 'alert unverified'
      alert.verified = 0
    }
    yield alert.save()
    // pass the action and it's data to the websocket
    ws.channel('live').emit('message', {
      type: 'action',
      message: message
    })
    return response.status(200).send(message.text)
  }

    /**
   * Edits alert comments attribute
   * @param {*} request
   * @param {*} response
   */
  * editComments (request, response) {
    const id = request.param('id')
    const text = request.input('text')
    const alert = yield Alert.findBy('id', id)
    let message = {
      text: 'alert comments changed',
      data: alert
    }
    alert.comments = text
    yield alert.save()
    // pass the action and it's data to the websocket
    ws.channel('live').emit('message', {
      type: 'action',
      message: message
    })
    return response.status(200).send(message.text)
  }
}

module.exports = AlertController
