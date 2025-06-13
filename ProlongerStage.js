const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Prolongation pour une soumission classique
  router.put('/soumissions/:id/prolongation', (req, res) => {
    const soumissionId = req.params.id;
    const { observation } = req.body;

    const updateQuery = `
      UPDATE soumission
      SET 
        statut_id = (SELECT id FROM statut WHERE libele = 'Prolongé'),
        extension = IFNULL(extension, 0) + 1,
        observation = ?
      WHERE id = ?
    `;

    db.query(updateQuery, [observation || '', soumissionId], (err, result) => {
      if (err) {
        console.error('Erreur SQL :', err);
        return res.status(500).json({ message: "Erreur lors de la mise à jour de la candidature", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Candidature non trouvée" });
      }

      res.json({ message: "Candidature prolongée avec succès." });
    });
  });

  // Prolongation pour une candidature spontanée
  router.put('/candidatures-spontanees/:id/prolongation', (req, res) => {
    const candidatureId = req.params.id;
    const { observation } = req.body;

    const updateQuery = `
      UPDATE candidature
      SET 
        statut = 'Prolongé',
        extention = extention + 1,
        observation = ?
      WHERE id = ?
    `;

    db.query(updateQuery, [observation || '', candidatureId], (err, result) => {
      if (err) {
        console.error('Erreur SQL :', err);
        return res.status(500).json({ message: "Erreur lors de la mise à jour de la candidature spontanée", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Candidature spontanée non trouvée" });
      }

      res.json({ message: "Candidature spontanée prolongée avec succès." });
    });
  });

  return router;
};
