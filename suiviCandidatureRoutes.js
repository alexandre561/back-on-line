const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/suivi-candidature/:code', (req, res) => {
    const code = req.params.code;
    console.log('🔍 Vérification de la soumission pour le code :', code);

    const querySoumission = `
      SELECT 
        c.id AS id,
        c.nom, 
        c.prenom, 
        c.email,
        c.tel,
        s.code_unique AS code,
        s.date_soumission AS dateSoumission,
        st.libele AS statut,
        stg.intitule AS nomStage,
        d.libele AS domaine,
        srv.libele AS service,
        dir.libele AS direction,
        stg.date_debut,
        stg.date_fin
      FROM soumission s
      JOIN candidat c ON c.id = s.candidat_id
      JOIN statut st ON s.statut_id = st.id
      JOIN stage stg ON s.stage_id = stg.id
      JOIN domaine d ON stg.domaine_id = d.id
      JOIN service srv ON stg.service_id = srv.id
      JOIN direction dir ON stg.direction_id = dir.id
      WHERE s.code_unique = ?
    `;

    db.query(querySoumission, [code], (err, results) => {
      if (err) {
        console.error('❌ Erreur SQL Soumission :', err);
        return res.status(500).json({ message: "Erreur serveur", error: err });
      }

      if (results.length === 0) {
        console.warn('❌ Aucune soumission trouvée pour le code :', code);
        return res.status(404).json({ message: "Aucune candidature trouvée pour ce code." });
      }

      console.log('✅ Soumission trouvée pour le code :', code);
      return res.json({ type: "soumission", data: results[0] });
    });
  });

  return router;
};
