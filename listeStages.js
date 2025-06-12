module.exports = (db) => {
  const express = require('express');
  const router = express.Router();

  // Middleware pour vérifier les dates
  const validateDates = (req, res, next) => {
    const { date_debut, date_fin } = req.body;
    
    if (date_fin && new Date(date_fin) < new Date()) {
      return res.status(400).json({ message: "La date de fin doit être dans le futur" });
    }
    
    if (date_debut && date_fin && new Date(date_debut) > new Date(date_fin)) {
      return res.status(400).json({ message: "La date de début doit être antérieure à la date de fin" });
    }
    
    next();
  };

  // Mettre à jour les stages expirés et récupérer la liste
  router.get('/listeStages', (req, res) => {
    const updateQuery = `
      UPDATE Stage 
      SET statut_id = (
        SELECT id FROM Statut WHERE libele = 'Fermé'
      )
      WHERE date_fin < CURDATE() 
      AND statut_id != (
        SELECT id FROM Statut WHERE libele = 'Fermé'
      )
    `;

    db.query(updateQuery, (updateErr) => {
      if (updateErr) {
        console.error("Erreur lors de la mise à jour des statuts :", updateErr);
        return res.status(500).json({ message: "Erreur lors de la mise à jour des statuts", error: updateErr });
      }

      const selectQuery = `
        SELECT 
          s.id, 
          s.intitule, 
          s.date_debut, 
          s.date_fin, 
          st.libele AS statut, 
          st.id AS statut_id,
          s.image, 
          d.libele AS domaine, 
          n.libele AS niveau_etude, 
          se.libele AS service,
          dir.id AS direction_id,
          dir.libele AS direction_libele
        FROM Stage s
        JOIN Domaine d ON s.domaine_id = d.id
        JOIN Niveau_Etude n ON s.niveau_etude_id = n.id
        JOIN Service se ON s.service_id = se.id
        JOIN Statut st ON s.statut_id = st.id
        LEFT JOIN Direction dir ON s.direction_id = dir.id
      `;

      db.query(selectQuery, (selectErr, result) => {
        if (selectErr) {
          console.error("Erreur lors de la récupération des stages :", selectErr);
          return res.status(500).json({ message: "Erreur serveur", error: selectErr });
        }

        res.status(200).json(result);
      });
    });
  });

  // Mettre à jour les dates d'un stage
 // Mettre à jour les dates d'un stage
router.put('/stages/:id/dates', validateDates, (req, res) => {
  const { id } = req.params;
  const { date_debut, date_fin } = req.body;

  if (!date_fin) {
    return res.status(400).json({ message: "La date de fin est obligatoire" });
  }

  const updateDatesQuery = `
    UPDATE Stage 
    SET 
      date_debut = ?, 
      date_fin = ? 
    WHERE id = ?
  `;

  db.query(updateDatesQuery, [date_debut || null, date_fin, id], (err, result) => {
    if (err) {
      console.error("Erreur lors de la mise à jour des dates :", err);
      return res.status(500).json({ message: "Erreur lors de la mise à jour des dates", error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Stage non trouvé" });
    }

    // Vérifier si date_fin > aujourd'hui, et mettre le statut à "Ouvert" si nécessaire
    const today = new Date().toISOString().split('T')[0];
    if (date_fin > today) {
      const updateStatusQuery = `
        UPDATE Stage 
        SET statut_id = (
          SELECT id FROM Statut WHERE libele = 'Ouvert'
        ) 
        WHERE id = ?
      `;

      db.query(updateStatusQuery, [id], (statusErr) => {
        if (statusErr) {
          console.error("Erreur lors de la mise à jour du statut :", statusErr);
          return res.status(500).json({ message: "Dates mises à jour, mais erreur lors du changement de statut", error: statusErr });
        }

        return res.status(200).json({ message: "Dates et statut mis à jour avec succès" });
      });
    } else {
      return res.status(200).json({ message: "Dates mises à jour avec succès" });
    }
  });
});


 
  return router;
};