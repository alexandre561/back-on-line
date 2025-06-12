const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // Liste des candidatures validées ou prolongées classiques (Soumission)
  router.get("/candidatures-valides", (req, res) => {
    const query = `
      SELECT 
        sou.id AS soumission_id,
        sou.date_soumission,
        sou.lettre_motivation,
        sou.code_unique,
        sou.extension,
        sou.observation,
        c.id AS candidat_id,
        c.nom AS candidat_nom,
        c.email AS candidat_email,
        s.id AS stage_id,
        s.intitule AS stage_nom,
        s.date_debut,
        s.date_fin,
        s.image,
        d.libele AS domaine,
        se.libele AS service,
        st.libele AS statut
      FROM Soumission sou
      JOIN Candidat c ON sou.candidat_id = c.id
      JOIN Stage s ON sou.stage_id = s.id
      JOIN Domaine d ON s.domaine_id = d.id
      JOIN Service se ON s.service_id = se.id
      JOIN Statut st ON sou.statut_id = st.id
      WHERE st.libele IN ('Validé', 'Prolongé')
      ORDER BY sou.date_soumission DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des candidatures validées :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      console.log("Résultats renvoyés :", results);
      res.json(results);
    });
  });

  // Liste des candidatures spontanées validées ou prolongées
  router.get("/candidatures-spontanees-valides", (req, res) => {
    const query = `
      SELECT
        c.id,
        c.nom,
        c.prenom,
        c.email,
        c.date_naissance,
        c.telephone,
        c.adresse,
        c.lettre_motivation,
        c.image_url,
        c.code,
        c.statut,
        c.extention,
        c.observation,
        DATE_FORMAT(c.date_creation, '%Y-%m-%d %H:%i:%s') AS date_creation,
        de.libele AS domaine_etudes,
        ne.libele AS niveau_etudes
      FROM Candidature c
      LEFT JOIN Domaine de ON c.domaine_etudes = de.id
      LEFT JOIN Niveau_Etude ne ON c.niveau_etudes = ne.id
      WHERE c.statut IN ('Validé', 'Prolongé')
      ORDER BY c.date_creation DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des candidatures spontanées validées :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      console.log("Résultats candidatures spontanées :", results);
      res.json(results);
    });
  });

  // Route pour prolonger une candidature spontanée
router.put("/candidatures-spontanees-prolonger/:id", (req, res) => {
  const candidatureId = req.params.id;
  const { statut, extension_pass, observation, date_extension } = req.body;

  const query = `
    UPDATE Candidature
    SET 
      statut = ?,
      extention = ?,  
      observation = ?,
      date_extension = ?
    WHERE id = ?
  `;

  db.query(query, [statut, extension_pass, observation, date_extension, candidatureId], (err, result) => {
    if (err) {
      console.error("Erreur lors de la mise à jour de la candidature :", err);
      return res.status(500).json({ error: "Erreur serveur lors de la mise à jour" });
    }
    res.json({ message: "Candidature prolongée avec succès" });
  });
});

  return router;
};
