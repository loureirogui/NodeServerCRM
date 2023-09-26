// This is an API responsible for manage login logic, prospects table, tasklist table and encrypted password

require('dotenv').config();
const { secretKey, dbConfig } = require('./config');
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const db = mysql.createConnection(dbConfig);

app.use(cors());
app.use(express.json());

// Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email is registered
  const findEmail = 'SELECT * FROM user WHERE email = ?';
  db.query(findEmail, [email], (err, results) => {
    if (err) {
      console.log('Erro ao buscar usuário:', err.message);
      return res.status(500).end();
    }

    if (results.length === 0) {
      console.log('Usuário não encontrado');
      return res.status(401).end();
    }

    const user = results[0];

    // Check if password input matches with database value
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error('Erro ao comparar senhas:', err);
        return res.status(500).end();
      }

      if (result) {
        // If success creates a token to send between pages
        const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '6h' });
        console.log('Login realizado com sucesso!');
        console.log('Token:', token);
        return res.json({ token }); 
      } else {
        console.log('Senha incorreta');
        console.log('Valor digitado pelo usuário:', password);
        console.log('Senha armazenada no banco de dados:', user.password);
        return res.status(401).end();
      }
    });
  });
});


// Function responsible for compare if token got is valid
const verifyToken = (req, res, next) => {
  const validated = req.headers.authorization;

  if (!validated) {
    console.log('Token não fornecido');
    return res.status(401).end();
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log('Token inválido');
      return res.status(401).end();
    }

    req.user = decoded;
    next();
  });
};

// Protected Route if success verifyToken
app.get('/data', verifyToken, (req, res) => {
  console.log('Bem vinda!');
  console.log('Usuário:', req.user);
  res.end();
});

// API with id, name and phone of prospects from my database
app.get('/TesteApi', (req, res) => {
  db.query('SELECT * FROM yourTable', (error, results, fields) => {
    if (error) {
      console.log('Error executing the query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

// Path to the tasklist database, in this project, front end is filtering data if estado=pendente
app.get('/taskList', (req, res) => {
  db.query('SELECT * FROM yourTable', (error, results, fields) => {
    if (error) {
      console.log('Error executing the query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});


// Path that adds a new task on the table
app.post('/addTask', (req, res) => {
  const { nome, descricao, data, estado, telefone } = req.body;

  if (!nome || !data) {
    res.status(400).json({ error: 'Nome e Data são obrigatórios' });
    return;
  }

  const query = 'INSERT INTO yourTable (nome, descricao, data, estado, telefone) VALUES (?, ?, ?, ?, ?)';
  const values = [nome, descricao, data, estado, telefone];

  db.query(query, values, (error, results, fields) => {
    if (error) {
      console.log('Error executing the query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json({ message: 'Tarefa adicionada com sucesso', taskId: results.insertId });
  });
});


// Path that change estado from pendente to concluido, with this stop rendering the finished task on the client side
app.put('/updateTaskState/:taskOs', (req, res) => {
  const taskOs = req.params.taskOs; 

  const query = 'UPDATE yourTable SET estado = ? WHERE os = ?';
  const values = ['concluido', taskOs];

  db.query(query, values, (error, results, fields) => {
    if (error) {
      console.log('Error executing the query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Tarefa não encontrada' });
      return;
    }
    res.json({ message: 'Estado da tarefa atualizado para "concluído"' });
  });
});

app.listen(1995, () => {
  console.log('Servidor iniciado na porta 1995');
});