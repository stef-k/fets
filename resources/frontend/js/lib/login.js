class Login {
  constructor () {
    this.mainUrl = window.location.protocol + '//' + window.app.host
    this.loginUrl = window.location.protocol + '//' + window.app.host + '/api/v1/session/login'
    this.logoutUrl = window.location.protocol + '//' + window.app.host + '/api/v1/session/logout'
    this.loginBtn = $('.do-login')
    this.feedback = $('.login-feedback')
    this.email = $('.email-input')
    this.password = $('.password-input')
    this.logoutMenu = $('#logout')
    this.attachListeners()
  }
  attachListeners () {
    $('.do-login').on('click', () => {
      this.userLogin()
    })
    this.logoutMenu.on('click', (e) => {
      e.preventDefault()
      this.userLogout()
    })
  }

  /**
   * Performs pre request validation and login request.
   */
  userLogin () {
    this.feedback.text('')
    let email = this.email.val()
    let password = this.password.val()
    if (email === '' || password === '') {
      this.feedback.text('Τα πεδία Email και κωδικός, είναι υποχρεωτικά για την είσοδο σας στην εφαρμογή!').addClass('error')
    } else {
      this.loginBtn.addClass('is-loading')
      $.ajax({
        url: this.loginUrl,
        type: 'POST',
        data: {email: email, password: password},
        success: (res) => {
          this.loginBtn.removeClass('is-loading')
          window.location = '/'
        },
        error: (err) => {
          let feedback = ''
          console.log(err)
          if (err.responseJSON.error.name === 'PasswordMisMatchException') {
            feedback = 'Λάθος κωδικός, παρακαλούμε ελέγξτε τον κωδικό που εισάγετε...'
          } else if (err.responseJSON.error.name === 'UserNotFoundException') {
            feedback = 'Λάθος Email, παρακαλούμε ελέγξτε το Email που εισάγετε...'
          } else {
            feedback = `Παρουσιάστηκε κάποιο πρόβλημα κατά τη διαδικασία σύνδεσης,
            παρακαλούμε όπως αναφέρατε τον ακόλουθο κωδικό στο τεχνικό προσωπικό: ` + err.responseJSON.error.name
          }
          this.loginBtn.removeClass('is-loading')
          this.feedback.text(feedback).addClass('error')
        }
      })
    }
  }
  /**
   * Performs the logout request
   */
  userLogout () {
    $.ajax({
      url: this.logoutUrl,
      type: 'POST',
      success: (res) => {
        // redirect to login page
        window.location = '/login'
      },
      error: (err) => {
        this.loginBtn.removeClass('is-loading')
        this.feedback.text('Παρουσιάστηκε σφάλμα κατά την αποσύνδεση, παρακαλούμε δοκιμάστε σε λίγο.').addClass('error')
      }
    })
  }
}
export {Login}
