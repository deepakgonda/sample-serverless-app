
module.exports = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    },
    debug: process.env.NODE_ENV === 'local' ? true : false,
    pool: {
        min: 1,
        max: 1,
        afterCreate: async (conn, done) => {
            console.log('AFTER CREATE DB CONNECTION');
            await conn.query('SET timezone="UTC";');
            done(null, conn);
        }
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: __dirname + '/src/db/migrations',
    },
    seeds: {
        directory: __dirname + '/src/db/seeds'
    }
});