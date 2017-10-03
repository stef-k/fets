'use strict'

const Schema = use('Schema')

class AlertsTableSchema extends Schema {
  up () {
    this.create('alerts', (table) => {
      table.increments()
      table.string('phonenumber').notNullable()
      table.decimal('lat', 10, 8).notNullable()
      table.decimal('lon', 11, 8).notNullable()
      table.integer('verified').unsigned().default(0)
      table.text('comments').nullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('alerts')
  }
}

module.exports = AlertsTableSchema
