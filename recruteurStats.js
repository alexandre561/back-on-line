const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  router.get("/statistiques", (req, res) => {
    const results = {};

    db.query("SELECT COUNT(*) AS total FROM stage", (err, rows1) => {
      if (err) return handleError(res, err);
      results.offres = rows1[0].total;

      db.query(`
        SELECT COUNT(*) AS total 
        FROM soumission 
        INNER JOIN statut ON soumission.statut_id = statut.id 
        WHERE statut.libele = 'En attente'
      `, (err, rows2) => {
        if (err) return handleError(res, err);
        results.offresEnAttente = rows2[0].total;

        db.query("SELECT COUNT(*) AS total FROM Soumission", (err, rows3) => {
          if (err) return handleError(res, err);
          results.candidatures = rows3[0].total;

          db.query(`
            SELECT COUNT(*) AS total 
            FROM soumission 
            INNER JOIN statut ON soumission.statut_id = statut.id 
            WHERE statut.libele IN ('Validé', 'Prolongé')
          `, (err, rows4) => {
            if (err) return handleError(res, err);
            results.candidatsSelectionnes = rows4[0].total;

            res.json(results);
          });
        });
      });
    });
  });

  function handleError(res, error) {
    console.error("Erreur lors de la récupération des statistiques :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }

  return router;
};
