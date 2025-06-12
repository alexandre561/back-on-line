const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Liste des candidatures spontanées
  router.get('/candidatures-spontanees', (req, res) => {
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
        DATE_FORMAT(c.date_creation, '%Y-%m-%d %H:%i:%s') AS date_creation,
        de.libele AS domaine_etudes,
        ne.libele AS niveau_etudes
      FROM candidature c
      LEFT JOIN domaine de ON c.domaine_etudes = de.id
      LEFT JOIN niveau_etude ne ON c.niveau_etudes = ne.id
      ORDER BY c.date_creation DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des candidatures spontanées :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      res.json(results);
    });
  });

  // Ajoute cette route dans le fichier où tu gères les candidatures spontanées

router.put('/candidatures-spontanees-statut/:id', (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  if (!statut) {
    return res.status(400).json({ error: "Le statut doit être fourni." });
  }

  const statutsValides = ["En cours", "Validé", "Rejeté"];
  if (!statutsValides.includes(statut)) {
    return res.status(400).json({ error: `Le statut doit être l'un de : ${statutsValides.join(", ")}` });
  }

  const updateQuery = `
    UPDATE candidature
    SET statut = ?
    WHERE id = ?;
  `;

  db.query(updateQuery, [statut, id], (err, results) => {
    if (err) {
      console.error("Erreur lors de la mise à jour du statut :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Candidature non trouvée" });
    }

    res.json({ message: `Candidature spontanée mise à jour avec le statut '${statut}' avec succès.` });
  });
});

  return router;
};
