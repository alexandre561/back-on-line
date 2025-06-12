const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Récupérer les stages ouverts
  router.get('/stages-ouverts', (req, res) => {
    // Étape 1 : Mettre à jour les stages expirés
    const updateQuery = `
      UPDATE Stage 
      SET statut_id = (
        SELECT id FROM Statut WHERE libele = 'Fermé'
      )
      WHERE date_fin < CURDATE()
        AND statut_id != (SELECT id FROM Statut WHERE libele = 'Fermé')
    `;

    db.query(updateQuery, (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: 'Erreur lors de la mise à jour des statuts', error: updateErr });
      }

      // Étape 2 : Récupérer uniquement les stages encore "Ouverts"
      const selectQuery = `
        SELECT 
          s.id, 
          s.intitule, 
          s.date_debut, 
          s.date_fin, 
          s.image,   
          st.libele AS statut, 
          d.libele AS domaine, 
          n.libele AS niveau_etude, 
          sv.libele AS service
        FROM Stage s
        JOIN Statut st ON s.statut_id = st.id
        JOIN Domaine d ON s.domaine_id = d.id
        JOIN Niveau_Etude n ON s.niveau_etude_id = n.id
        JOIN Service sv ON s.service_id = sv.id
        WHERE st.libele = 'Ouvert'
      `;

      db.query(selectQuery, (selectErr, result) => {
        if (selectErr) {
          return res.status(500).json({ message: 'Erreur de récupération des stages ouverts', error: selectErr });
        }
        res.json(result);
      });
    });
  });

  return router;
};
