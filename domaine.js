const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Récupérer les domaines d'études
  router.get('/domaines-etudes', (req, res) => {
    const query = 'SELECT id, libele FROM domaine';
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur de récupération des domaines d\'études', error: err });
      }
      res.json(result);
    });
  });

  return router;
};
