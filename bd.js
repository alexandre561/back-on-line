// db.js
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gestion_stagiaires'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion MySQL :', err);
  } else {
    console.log('✅ MySQL connecté');
  }
});

module.exports = db;
