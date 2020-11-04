// load modules
const express = require('express');

// SQL
const SQL_GET_SHOW_NAMES_DESC = 'select tvid, name from tv_shows order by name desc limit ?';
const SQL_GET_SHOW_BY_ID = 'select * from tv_shows where tvid = ?';

const r = (pool) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        const conn = await pool.getConnection();

        try {
            const [ shows, _ ] = await conn.query(SQL_GET_SHOW_NAMES_DESC, [20]);

            res.status(200);
            res.type('text/html');
            res.render('index', { shows });
        } catch(e) {
            res.status(500);
            res.type('text/html');
            res.send(JSON.stringify(e));
        } finally {
            conn.release();
        }
    });

    router.get('/show/:tvid', async (req, res) => {
        const tvid = req.params.tvid;

        const conn = await pool.getConnection();

        try {
            const [ info, _ ] = await conn.query(SQL_GET_SHOW_BY_ID, [tvid]);

            if(info.length <= 0) {
                res.status(404);
                res.type('text/html');
                res.send(`Not found: ${tvid}`);
                return;
            }

            res.status(200);
            res.type('text/html');
            res.render('info', { info: info[0] });
        } catch(e) {
            res.status(500);
            res.type('text/html');
            res.send(JSON.stringify(e));
        } finally {
            conn.release();
        }
    });

    return router;
};

module.exports = r;