// routes/directions.js

const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/directions', (req, res) => {
    const query = `
      SELECT id, libele from direction;
    `;
    
    db.query(query, (err, result) => {
      if (err) {
        return res.status(500).json({ 
          message: 'Erreur de récupération des directions', 
          error: err 
        });
      }
      res.json(result);
    });
  });

  return router; 
};
