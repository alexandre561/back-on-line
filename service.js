const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Récupérer la liste des services
  router.get('/services', (req, res) => {
    const query = 'SELECT id, libele FROM service';
    
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur de récupération des services', error: err });
      }
      res.json(result);
    });
  });

  return router;
};
