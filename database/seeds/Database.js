'use strict'

/*
|--------------------------------------------------------------------------
| Database Seeder
|--------------------------------------------------------------------------
| Database Seeder can be used to seed dummy data to your application
| database. Here you can make use of Factories to create records.
|
| make use of Ace to generate a new seed
|   ./ace make:seed [name]
|
*/

// const Factory = use('Factory')
const Database = use('Database')
const Hash = use('Hash')
class DatabaseSeeder {
  * run () {
    yield Database.table('users').insert({
      username: 'admin',
      password: yield Hash.make('admin'),
      email: 'admin',
      created_at: new Date(),
      updated_at: new Date()
    })
    // yield Factory.model('App/Model/User').create(5)
  }
}

module.exports = DatabaseSeeder
