const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (db) => {
  router.post('/ajouterStage', (req, res) => {
    const {
      intitule,
      date_debut,
      date_fin,
      domaine_id,
      niveau_etude_id,
      service_id,
      statut_id = 1,
      image,
      direction_id // ✅ nouveau champ
    } = req.body;

    const query = `
      INSERT INTO stage (
        intitule, 
        date_debut, 
        date_fin, 
        domaine_id, 
        niveau_etude_id, 
        service_id, 
        statut_id, 
        image,
        direction_id
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [
      intitule,
      date_debut,
      date_fin,
      domaine_id,
      niveau_etude_id,
      service_id,
      statut_id,
      image,         // URL de l'image
      direction_id   // ✅ ID de la direction
    ], (err, result) => {
      if (err) {
        console.error("Erreur lors de l'ajout du stage :", err);
        return res.status(500).json({ message: "Erreur serveur", error: err });
      }

      res.status(201).json({ message: "Stage ajouté avec succès", stageId: result.insertId });
    });
  });

  return router;
};
