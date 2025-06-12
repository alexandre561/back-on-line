const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // Liste des candidatures
  router.get("/listecandidature", (req, res) => {
    const query = `
      SELECT 
        sou.id AS soumission_id,
        sou.date_soumission,
        sou.lettre_motivation,
        sou.cv,  
        sou.code_unique,
        c.id AS candidat_id,
        c.nom AS candidat_nom,
        c.email AS candidat_email,
        c.image AS candidat_image,       
        s.id AS stage_id,
        s.intitule AS stage_nom,
        s.date_debut,
        s.date_fin,
        d.libele AS domaine,
        se.libele AS service,
        st.libele AS statut
      FROM soumission sou
      JOIN candidat c ON sou.candidat_id = c.id
      JOIN stage s ON sou.stage_id = s.id
      JOIN domaine d ON s.domaine_id = d.id
      JOIN service se ON s.service_id = se.id
      JOIN statut st ON sou.statut_id = st.id
      ORDER BY sou.date_soumission DESC
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des candidatures :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      results.forEach(result => {
        // L'image est envoyée telle quelle
        result.candidat_image = result.candidat_image;

        // Générer le lien d'accès au CV
        if (result.cv) {
          result.cv = `/api/cv/${result.soumission_id}`;
        }
      });

      console.log("Candidatures récupérées :", results);
      res.json(results);
    });
  });

  // Route pour afficher un CV sous forme de fichier PDF
  router.get("/cv/:id", (req, res) => {
    const soumissionId = req.params.id;

    const query = `SELECT cv FROM Soumission WHERE id = ?`;

    db.query(query, [soumissionId], (err, results) => {
      if (err || results.length === 0 || !results[0].cv) {
        console.error("CV non trouvé ou erreur :", err);
        return res.status(404).send("CV non trouvé.");
      }

      const cvBuffer = results[0].cv;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=cv.pdf");
      res.send(cvBuffer);
    });
  });

  // Mise à jour du statut d'une candidature
  router.put("/candidatures/:id", (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;

    if (!statut) {
      return res.status(400).json({ error: "Le statut doit être fourni." });
    }

    const statutsValides = ["En cours", "Validé", "Rejeté"];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ error: `Le statut doit être l'un de : ${statutsValides.join(", ")}` });
    }

    const statutQuery = `SELECT id FROM Statut WHERE libele = ?`;

    db.query(statutQuery, [statut], (err, result) => {
      if (err) {
        console.error("Erreur lors de la récupération du statut :", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      if (result.length === 0) {
        return res.status(400).json({ error: "Statut non trouvé dans la base de données." });
      }

      const statut_id = result[0].id;

      const updateQuery = `
        UPDATE Soumission
        SET statut_id = ?
        WHERE id = ?;
      `;

      db.query(updateQuery, [statut_id, id], (err, results) => {
        if (err) {
          console.error("Erreur lors de la mise à jour du statut :", err);
          return res.status(500).json({ error: "Erreur serveur" });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Candidature non trouvée" });
        }

        res.json({ message: `Candidature mise à jour avec le statut '${statut}' avec succès.` });
      });
    });
  });

  return router;
};
