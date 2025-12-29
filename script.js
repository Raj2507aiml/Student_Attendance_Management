async function loadStudents() {
  try {
    const res = await fetch('http://localhost:3000/students');
    const students = await res.json();
    const select = document.getElementById('student-select');
    select.innerHTML = '';
    const list = document.getElementById('students-list');
    list.innerHTML = '';
    students.forEach(s => {
      const option = document.createElement('option');
      option.value = s.id;
      option.textContent = s.name;
      select.appendChild(option);

      const li = document.createElement('li');
      li.textContent = `${s.name} (Roll: ${s.roll_no}) `;
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => deleteStudent(s.id);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading students:', error);
    alert('Failed to load students');
  }
}

async function loadAttendance() {
  try {
    const res = await fetch('http://localhost:3000/attendance');
    const records = await res.json();
    const tbody = document.querySelector('#attendance-table tbody');
    tbody.innerHTML = '';
    records.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.name}</td>
        <td>${r.roll_no}</td>
        <td>${r.status}</td>
        <td>${r.date}</td>
        <td><button onclick="deleteAttendance(${r.id})">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error loading attendance:', error);
    alert('Failed to load attendance');
  }
}

async function addStudent() {
  const name = document.getElementById('student-name').value;
  const roll_no = document.getElementById('student-roll').value;
  try {
    const res = await fetch('http://localhost:3000/addStudent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, roll_no })
    });
    let data = {};
    try {
      data = await res.json();
    } catch (e) {}
    if (res.ok) {
      console.log('Student added successfully');
      alert('Student added successfully');
      document.getElementById('student-name').value = '';
      document.getElementById('student-roll').value = '';
      loadStudents();
    } else {
      throw new Error(data.error || 'Failed to add student');
    }
  } catch (error) {
    console.error('Error adding student:', error);
    alert(error.message);
  }
}

async function markAttendance() {
  const student_id = document.getElementById('student-select').value;
  const status = document.getElementById('status-select').value;
  try {
    const res = await fetch('http://localhost:3000/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, status })
    });
    let data = {};
    try {
      data = await res.json();
    } catch (e) {}
    if (res.ok) {
      console.log('Attendance marked successfully');
      alert('Attendance marked successfully');
      loadAttendance();
    } else {
      throw new Error(data.error || 'Failed to mark attendance');
    }
  } catch (error) {
    console.error('Error marking attendance:', error);
    alert(error.message);
  }
}

async function deleteAttendance(id) {
  try {
    const res = await fetch(`http://localhost:3000/attendance/${id}`, {
      method: 'DELETE'
    });
    let data = {};
    try {
      data = await res.json();
    } catch (e) {}
    if (res.ok) {
      console.log('Attendance deleted successfully');
      alert('Attendance deleted successfully');
      loadAttendance();
    } else {
      throw new Error(data.error || 'Failed to delete attendance');
    }
  } catch (error) {
    console.error('Error deleting attendance:', error);
    alert(error.message);
  }
}

async function deleteStudent(id) {
  if (!confirm('Are you sure you want to delete this student?')) return;
  try {
    const res = await fetch(`http://localhost:3000/students/${id}`, {
      method: 'DELETE'
    });
    let data = {};
    try {
      data = await res.json();
    } catch (e) {}
    if (res.ok) {
      console.log('Student deleted successfully');
      alert('Student deleted successfully');
      loadStudents();
      loadAttendance();
    } else {
      throw new Error(data.error || 'Failed to delete student');
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    alert(error.message);
  }
}

window.onload = () => {
  loadStudents();
  loadAttendance();
};