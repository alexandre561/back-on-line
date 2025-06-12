const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.get('/spontanee/:code', (req, res) => {
    const code = req.params.code;

    console.log('\n🔎 Requête reçue pour candidature spontanée');
    console.log('📨 Code reçu :', code);

    const query = `
      SELECT 
        id,
        nom,
        prenom,
        email,
        telephone,
        adresse,
        domaine_etudes AS domaine,
        niveau_etudes AS niveau,
        lettre_motivation AS lettreMotivation,
        image_url AS imageUrl,
        code,
        statut,
        cv_filename AS cv,
        DATE_FORMAT(date_creation, '%Y-%m-%d %H:%i:%s') AS dateSoumission
      FROM candidature
      WHERE code = ?
    `;

    db.query(query, [code], (err, results) => {
      if (err) {
        console.error("❌ Erreur SQL Spontanée:", err);
        return res.status(500).json({ message: "Erreur serveur", error: err });
      }

      console.log('📦 Résultat de la requête :', results);

      if (results.length === 0) {
        console.warn('⚠️ Aucun résultat trouvé pour le code :', code);
        return res.status(404).json({ message: "Candidature non trouvée" });
      }

      console.log('✅ Candidature spontanée trouvée pour :', code);
      return res.json({ type: "spontanée", data: results[0] });
    });
  });

  return router;
};
