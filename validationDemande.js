const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  
  router.post('/valider/:id', (req, res) => {
    const demandeId      = req.params.id;
    const commentaire    = req.body.commentaire || null;
    const dateTraitement = new Date();

    const sql  = `
      UPDATE Demande
      SET  id_statut       = ?,
           decision        = ?,
           date_traitement = ?,
           commentaire     = ?
      WHERE id = ?`;
    const data = [2, 'validée', dateTraitement, commentaire, demandeId];

    db.query(sql, data, (err, result) => {
      if (err) {
        console.error('[ERREUR] Validation :', err);
        return res.status(500).json({ message: 'Erreur lors de la validation', error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Demande non trouvée' });
      }
      res.status(200).json({ message: 'Demande validée avec succès' });
    });
  });

 
  router.post('/rejeter/:id', (req, res) => {
    const demandeId      = req.params.id;
    const commentaire    = req.body.commentaire || 'Demande rejetée';
    const dateTraitement = new Date();

    const sql  = `
      UPDATE Demande
      SET  id_statut       = ?,
           decision        = ?,
           date_traitement = ?,
           commentaire     = ?
      WHERE id = ?`;
    const data = [3, 'rejetée', dateTraitement, commentaire, demandeId];

    db.query(sql, data, (err, result) => {
      if (err) {
        console.error('[ERREUR] Rejet :', err);
        return res.status(500).json({ message: 'Erreur lors du rejet', error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Demande non trouvée' });
      }
      res.status(200).json({ message: 'Demande rejetée avec succès' });
    });
  });

  return router;
};
