// load modules
const express = require('express');

// SQL
const SQL_GET_SHOW_NAMES_DESC = 'select tvid, name from tv_shows order by name desc limit ?';
const SQL_GET_SHOW_BY_ID = 'select * from tv_shows where tvid = ?';

const mkQuery = (sql, pool) => {
    const f = async (params) => {
        const conn = await pool.getConnection();

        try {
            const results = await conn.query(sql, params);
            return results[0];
        } catch(e) {
            return Promise.reject(e);
        } finally {
            conn.release();
        }
    };
    return f;
};

const r = (pool) => {
    const router = express.Router();

    const getTVList = mkQuery(SQL_GET_SHOW_NAMES_DESC, pool);
    const getTVShowById = mkQuery(SQL_GET_SHOW_BY_ID, pool);

    router.get('/', async (req, res) => {
        const conn = await pool.getConnection();

        try {
            const shows = await getTVList([20]);
            // const [ shows, _ ] = await conn.query(SQL_GET_SHOW_NAMES_DESC, [20]);

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
            const info = await getTVShowById([tvid]);
            // const [ info, _ ] = await conn.query(SQL_GET_SHOW_BY_ID, [tvid]);

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