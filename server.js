
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/addStudent', (req, res) => {
  const { name, roll_no } = req.body;
  db.run('INSERT INTO students (name, roll_no) VALUES (?, ?)', [name, roll_no], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.get('/students', (req, res) => {
  db.all('SELECT * FROM students', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/attendance', (req, res) => {
  const { student_id, status } = req.body;
  const date = new Date().toISOString().split('T')[0];
  db.run('INSERT OR REPLACE INTO attendance (student_id, status, date) VALUES (?, ?, ?)', [student_id, status, date], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

app.get('/attendance', (req, res) => {
  db.all('SELECT a.id, a.student_id, s.name, s.roll_no, a.status, a.date FROM attendance a JOIN students s ON a.student_id = s.id ORDER BY a.date DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/attendance/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.run('UPDATE attendance SET status = ? WHERE id = ?', [status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

app.delete('/attendance/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM attendance WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

app.delete('/students/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});