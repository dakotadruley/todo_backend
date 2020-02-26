require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const client = require('./lib/client');

client.connect();

const app = express();
const PORT = process.env.PORT;
app.use(morgan('dev')); // http logging
app.use(cors()); // enable CORS request
app.use(express.static('public')); // server files from /public folder
app.use(express.json()); // enable reading incoming json data

app.get('/api/todos', async (req, res) => {
    try {
        const result = await client.query(`
            select * 
            from todos;
        `);

        res.json(result.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.post('/api/todos', async (req, res) => {

    try {
        const query = `
        insert into todos (task, complete)
        values ('${req.body.task}', false)
        returning *;
        `;

        const result = await client.query(`
        insert into todos (task, complete)
        values ($1, $2)
        returning *;`,

        [req.body.task, false]);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    const id = req.params.id;
    const todo = req.body;

    try {
        const result = await client.query(`
        update todos
        set complete (true)
        where id = ${req.params.id}
        returning *;`
        
        [req.body.task, req.body.complete]);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.delete('api/todos/:id', async (req, res) => {
    try {
        const result = await client.query(`
        delete from todos
        where id = ${req.params.id}
        returning *;`);

        res.json(result.rows[0]);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message || err
        });
    }
});

app.listen(PORT, () => {
    console.log('server running on PORT', PORT);
});