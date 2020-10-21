const Knex = require('knex')
const hpass = require('./hashpass')
const host = process.env.LATTICE_DATABASE_HOST || 'localhost'

console.log(`To connect database at ${host}`)
const knex = Knex({
  client: 'pg',
  connection: {
    host: host,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  }
})

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
    table.string('name', 63).unique()
    table.string('salt', 255).notNullable()
    table.string('hashpass', 255).notNullable()
    table.timestamps()
    table.primary('name')
  })

  await createTable('login', function(table) {
    table.increments('id').primary()
    table.string('name').unsigned().notNullable()
    table.boolean('success').notNullable()
    table.datetime('datetime')
  })
}

exports.getUser = async function(name) {
  return knex('user').where('name', name).first()
}

exports.recordLogin = async function(name, success) {
  return knex('login').insert({
    name, success,
    datetime: knex.fn.now()
  })
}

if (require.main === module) {
  const { program } = require('commander')
  program
    .option('--init', 'initialized database and create user "admin"')
    .option('--password <password>', 'set password for user "admin"')
  program.parse(process.argv)

  if (program.init) {
    (async function() {
      try {
        await knex.schema.dropTableIfExists('user')
        await knex.schema.dropTableIfExists('login')
        await initTables()

        const user = 'admin'
        const pass = program.password || 'changeme!'
        const salt = hpass.randomHex(16)
        await knex('user').insert({
          name: user,
          salt: salt,
          hashpass: hpass.hashpass(user, pass, salt),
          created_at: knex.fn.now()
        })

        console.log(await exports.getUser('admin'))

        console.log('done')
        process.exit()

      } catch (err) {
        console.error(err.toString())
      }
    })()

  } else {
    program.help()
  }
}
