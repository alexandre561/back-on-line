const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Récupérer les niveaux d'études
  router.get('/niveaux-etudes', (req, res) => {
    const query = 'SELECT id, libele FROM niveau_etude';
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur de récupération des niveaux d\'études', error: err });
      }
      res.json(result);
    });
  });

  return router;
};
