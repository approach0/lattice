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
  },
  pool: {
    min: 0,
    max: 10
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
    table.string('name', 63).notNullable().unique()
    table.string('salt', 255).notNullable()
    table.string('hashpass', 255).notNullable()
    table.timestamps()
    table.primary('name')
  })

  await createTable('login', function(table) {
    table.increments('id').primary()
    table.string('from').notNullable()
    table.string('name').notNullable()
    table.boolean('success').notNullable()
    table.datetime('datetime')
  })
}

exports.initialize = async function(password) {
  await initTables()

  const user = 'admin'
  const pass = password || 'changeme!'
  const salt = hpass.randomHex(16)
  await knex('user').insert({
    name: user,
    salt: salt,
    hashpass: hpass.hashpass(user, pass, salt),
    created_at: knex.fn.now()
  })
}

exports.getUser = async function(name) {
  return knex('user').where('name', name).first()
}

exports.recordLogin = async function(from, name, success) {
  return knex('login').insert({
    from, name, success,
    datetime: knex.fn.now()
  })
}

/* return last failed logins attempts from user in last minutes */
exports.lastLogins = async function(from, name, minutes) {
  const timesplit = new Date(Date.now() - minutes * 60 * 1000)
  return knex('login')
    .where('name', name)
    .where('from', from)
    .where('success', false)
    .where('datetime', '>=', timesplit)
}

if (require.main === module) {
  const { program } = require('commander')
  program
    .option('--init', 'initialized database and create user "admin"')
    .option('--reset', 'delete all data and reset database tables')
    .option('--password <password>', 'set password for user "admin"')
  program.parse(process.argv)

  if (program.init || program.reset) {
    (async function() {
      /* reset database */
      try {
        if (program.reset) {
          await knex.schema.dropTableIfExists('user')
          await knex.schema.dropTableIfExists('login')
        }
      } catch (err) {
        console.error(err.toString())
      }

      try {
        await exports.initialize(program.password)
        console.log(await exports.getUser('admin'))

      } catch (err) {
        console.error(err.toString())
      }

      console.log('done')
      process.exit()
    })()

  } else {
    program.help()
  }
}
