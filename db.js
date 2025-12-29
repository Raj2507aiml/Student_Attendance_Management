const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./attendance.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    const createStudents = `CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      roll_no TEXT UNIQUE NOT NULL
    )`;

    const createAttendance = `CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('present', 'absent')) NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      UNIQUE(student_id, date)
    )`;

    db.run(createStudents, (err) => {
      if (err) {
        console.error('Error creating students table:', err.message);
      } else {
        console.log('Students table ready');
      }
    });

    db.run(createAttendance, (err) => {
      if (err) {
        console.error('Error creating attendance table:', err.message);
      } else {
        console.log('Attendance table ready');
      }
    });
  }
});

module.exports = db;