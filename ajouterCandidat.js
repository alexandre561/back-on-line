// routes/ajouterCandidat.js
const express = require('express');
const router = express.Router();
const db = require('./db'); // Assure-toi que tu importes correctement la connexion à la DB

// Route pour ajouter un candidat
router.post('/api/ajouter-candidat', (req, res) => {
  const { nom, prenom, email, dateNaissance, telephone, adresse, domaineEtudes, niveauEtudes } = req.body;

  const query = 'INSERT INTO candidat (nom, prenom, email, date_naissance, telephone, adresse, domaine_etudes, niveau_etude_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  
  db.query(query, [nom, prenom, email, dateNaissance, telephone, adresse, domaineEtudes, niveauEtudes], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de l\'ajout du candidat', error: err });
    }
    res.json({ candidatId: result.insertId }); // Renvoie l'ID du candidat
  });
});

module.exports = router;
