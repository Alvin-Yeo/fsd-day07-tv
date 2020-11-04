// load modules
const express = require('express');
const handlebars = require('express-handlebars');
const mysql = require('mysql2/promise');
const tv_app_router = require('./tv_app');

// configure port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000;

// create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'leisure',
    connectionLimit: 4,
    timezone: '+08:00'
});

// test db connection
const startApp = async(app, pool) => {
    try {
        const conn = await pool.getConnection();
        console.info(`Pinging database...`);
        await conn.ping();
        conn.release();

        // start server
        app.listen(PORT, () => {
            console.info(`Application started on PORT ${PORT} at ${new Date()}`);
        });
    } catch(e) {
        console.error(`Failed to ping database: ${e}`);
    }
};

// create an instance of express
const app = express();

// configure hbs
app.engine('hbs', handlebars({ defaultLayout: 'default.hbs' }));
app.set('view engine', 'hbs');

// applications
const tv_app = tv_app_router(pool);
app.use('/', tv_app);
app.use(express.static(__dirname + '/static'));

// start server
startApp(app, pool);