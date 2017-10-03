'use strict'

/*
|--------------------------------------------------------------------------
| Router
|--------------------------------------------------------------------------
|
| AdonisJs Router helps you in defining urls and their actions. It supports
| all major HTTP conventions to keep your routes file descriptive and
| clean.
|
| @example
| Route.get('/user', 'UserController.index')
| Route.post('/user', 'UserController.store')
| Route.resource('user', 'UserController')
*/

const Route = use('Route')

Route.get('/', 'PagesController.index')
Route.get('/about', 'PagesController.about')
Route.on('/login').render('partials/login-page')

// API endpoints

// User session controll endpoints
Route.group('session', () => {
  // Log in a user
  Route.post('login', 'UserController.login')
  // Logout a user
  Route.post('logout', 'UserController.logout')
}).prefix('api/v1/session')

// Alerts
Route.group('alerts', () => {
  // Get current alerts (public)
  Route.get('show', 'AlertController.show').middleware('auth')
  // Create a new alert (public)
  Route.post('create', 'AlertController.create')
  // Toggle verify an alert (available to logged in users only)
  Route.get('verify/:id', 'AlertController.verify').middleware('auth')
  // Delete an alert (available to logged in users only)
  Route.get('delete/:id', 'AlertController.delete').middleware('auth')
  // Edit an alert's comments (available to logged in users only)
  Route.post('edit-comments/:id', 'AlertController.editComments').middleware('auth')
}).prefix('api/v1/alerts')
