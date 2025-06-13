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
        // L'image reste inchangée
        result.candidat_image = result.candidat_image;

        // Lien d'accès au CV
        if (result.cv) {
          result.cv = `/api/cv/${result.soumission_id}`;
        }
      });

      console.log("✅ Candidatures récupérées :", results.length);
      res.json(results);
    });
  });

  // Affichage d'un CV
  router.get("/cv/:id", (req, res) => {
    const soumissionId = req.params.id;

    const query = `SELECT cv FROM soumission WHERE id = ?`;

    db.query(query, [soumissionId], (err, results) => {
      if (err || results.length === 0 || !results[0].cv) {
        console.error("❌ CV non trouvé ou erreur :", err);
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

    console.log("✅ PUT /candidatures/:id");
    console.log("🆔 ID candidature reçu :", id);
    console.log("📌 Statut reçu :", statut);

    if (!statut) {
      return res.status(400).json({ error: "Le statut doit être fourni." });
    }

    const statutsValides = ["En cours", "Validé", "Rejeté"];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ error: `Le statut doit être : ${statutsValides.join(", ")}` });
    }

    const statutQuery = `SELECT id FROM statut WHERE libele = ?`;

    db.query(statutQuery, [statut], (err, result) => {
      if (err) {
        console.error("❌ Erreur SELECT statut :", err);
        return res.status(500).json({ error: "Erreur serveur (SELECT statut)" });
      }

      if (!result || result.length === 0) {
        console.warn("⚠️ Statut non trouvé :", statut);
        return res.status(400).json({ error: "Statut non trouvé dans la base de données." });
      }

      const statut_id = result[0].id;
      console.log("✅ ID du statut récupéré :", statut_id);

      const updateQuery = `
        UPDATE soumission
        SET statut_id = ?
        WHERE id = ?;
      `;

      db.query(updateQuery, [statut_id, id], (err, results) => {
        if (err) {
          console.error("❌ Erreur UPDATE soumission :", err);
          return res.status(500).json({ error: "Erreur serveur (UPDATE soumission)" });
        }

        if (results.affectedRows === 0) {
          console.warn("⚠️ Aucune candidature mise à jour. ID non trouvé ?", id);
          return res.status(404).json({ error: "Candidature non trouvée" });
        }

        console.log("✅ Statut mis à jour pour la candidature :", id);
        res.json({ message: `Candidature mise à jour avec le statut '${statut}' avec succès.` });
      });
    });
  });

  return router;
};
