const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (db) => {
  // Route POST pour ajouter une demande
  router.post('/demande', upload.single('courrier'), (req, res) => {
    console.log('📨 Requête POST /demande reçue');

    const { date, service, candidat_id } = req.body;
    console.log('📦 Données reçues :', { date, service, candidat_id });
    console.log('📎 Fichier reçu :', req.file ? req.file.originalname : 'Aucun');

    const courrier = req.file?.buffer;

    if (!date || !service || !courrier || !candidat_id) {
      console.warn('❌ Champs requis manquants');
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const sql = `
      INSERT INTO Demande (date, service, courrier, id_stagiaire, id_statut)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [date, service, courrier, candidat_id, 1]; // statut 1 = "en attente" par défaut

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('❌ Erreur SQL :', err);
        return res.status(500).json({ message: 'Erreur lors de l\'insertion', error: err });
      }

      console.log('✅ Insertion réussie. ID :', result.insertId);
      res.status(201).json({ message: 'Demande enregistrée', id: result.insertId });
    });
  });

  return router;
};
