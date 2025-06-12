const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Mettre à jour le statut_id d’un stage
  router.put('/stages/:id/statut', (req, res) => {
    const { id } = req.params;
    const { statut_id } = req.body;

    console.log(`🔄 Requête reçue pour mise à jour du statut du stage ID ${id} avec statut_id = ${statut_id}`);

    if (!statut_id) {
      console.warn('⚠️ statut_id manquant dans la requête');
      return res.status(400).json({ message: 'Le champ statut_id est requis' });
    }

    const updateQuery = 'UPDATE stage SET statut_id = ? WHERE id = ?';

    db.query(updateQuery, [statut_id, id], (err, result) => {
      if (err) {
        console.error('❌ Erreur SQL :', err);
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error: err });
      }

      if (result.affectedRows === 0) {
        console.warn(`❗ Aucun stage trouvé avec l'ID ${id}`);
        return res.status(404).json({ message: 'Stage non trouvé' });
      }

      console.log(`✅ Statut du stage ID ${id} mis à jour avec succès`);
      res.json({ message: `Statut mis à jour pour le stage ID ${id}` });
    });
  });

  return router;
};
