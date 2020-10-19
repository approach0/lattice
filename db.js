var knex = require('knex')({
  client: 'pg',
  connection: {
    host: '0.0.0.0',
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  }
});

async function createTable(name, schema) {
  try {
    let exists = await knex.schema.hasTable(name)
    if (!exists) {
      console.log(`creating table '${name}' ...`)
      await knex.schema.createTable(name, schema)
    } else {
      console.log(`table '${name}' already exists`)
    }
  } catch (err) {
    console.error(err.toString())
  }
}

async function initTables() {
  await createTable('user', function(table) {
    table.increments('id').primary()
    table.string('name', 63)
    table.text('passwd', 255)
    table.timestamps()
  })

  await createTable('login', function(table) {
    table.increments('id').primary()
    table.integer('userid').unsigned().notNullable()
    table.timestamps()
  })

  knex.destroy()
}

initTables()
