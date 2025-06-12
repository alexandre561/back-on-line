const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Route de recherche de stages avec libellés
  router.get('/stages/recherche', (req, res) => {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Le mot-clé est requis dans la requête (ex: ?q=developpeur)' });
    }

    const keyword = `%${q}%`;

    const query = `
      SELECT 
        s.id,
        s.intitule,
        s.date_debut,
        s.date_fin,
        s.image,
        d.libele AS domaine,
        dir.libele AS direction,
        n.libele AS niveau_etude,
        se.libele AS service,
        st.libele AS statut
      FROM Stage s
      LEFT JOIN Domaine d ON s.domaine_id = d.id
      LEFT JOIN Direction dir ON s.direction_id = dir.id
      LEFT JOIN Niveau_Etude n ON s.niveau_etude_id = n.id
      LEFT JOIN Service se ON s.service_id = se.id
      LEFT JOIN Statut st ON s.statut_id = st.id
      WHERE s.intitule LIKE ?
    `;

    db.query(query, [keyword], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la recherche', error: err });
      }

      res.json(results);
    });
  });

  return router;
};
