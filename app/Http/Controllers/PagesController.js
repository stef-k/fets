'use strict'

class PagesController {
  * index (request, response) {
    const isLoggedIn = yield request.auth.check()
    if (!isLoggedIn) {
      response.redirect('/login')
    }
    yield response.sendView('welcome')
  }

  * about (request, response) {
    yield response.sendView('partials/about')
  }
}

module.exports = PagesController
