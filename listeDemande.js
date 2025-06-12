const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Route GET /liste-demandes : récupérer les demandes + info candidat
  router.get('/', (req, res) => {
    console.log("[GET] /liste-demandes - Début traitement requête");

    const query = `
      SELECT 
        d.id, d.date, d.service, d.courrier, d.cra, d.niu_livret, d.id_stagiaire, d.id_statut, d.id_motif,
        c.id AS stagiaire_id, c.nom, c.prenom, c.email
      FROM Demande d
      LEFT JOIN Candidat c ON d.id_stagiaire = c.id
      ORDER BY d.date DESC
      LIMIT 100
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("[ERROR] /liste-demandes - Erreur lors de la récupération des demandes :", err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des demandes', error: err });
      }

      console.log(`[SUCCESS] /liste-demandes - ${results.length} demandes récupérées`);

      // Reformater résultat : mettre les infos candidat dans un objet stagiaire
      const demandes = results.map(row => ({
        id: row.id,
        date: row.date,
        service: row.service,
        courrier: row.courrier,
        cra: row.cra,
        niu_livret: row.niu_livret,
        id_stagiaire: row.id_stagiaire,
        id_statut: row.id_statut,
        id_motif: row.id_motif,
        stagiaire: {
          id: row.stagiaire_id,
          nom: row.nom,
          prenom: row.prenom,
          email: row.email,
        }
      }));

      res.json(demandes);
    });
  });
// Route GET /courrier/:id - pour afficher ou télécharger le courrier d'une demande
router.get('/courrier/:id', (req, res) => {
  const demandeId = req.params.id;
  console.log(`[INFO] Requête reçue pour récupérer le courrier id=${demandeId}`);

  const query = 'SELECT courrier FROM Demande WHERE id = ?';

  db.query(query, [demandeId], (err, results) => {
    if (err) {
      console.error(`[ERROR] Erreur SQL lors de la récupération du courrier id=${demandeId} :`, err);
      return res.status(500).send("Erreur serveur.");
    }

    if (!results.length) {
      console.warn(`[WARN] Aucun courrier trouvé pour id=${demandeId}`);
      return res.status(404).send("Courrier non trouvé.");
    }

    if (!results[0].courrier) {
      console.warn(`[WARN] Courrier vide ou null pour id=${demandeId}`);
      return res.status(404).send("Courrier non trouvé.");
    }

    console.log(`[INFO] Courrier trouvé pour id=${demandeId}, envoi du PDF...`);
    const courrierBuffer = results[0].courrier;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=courrier.pdf");
    res.send(courrierBuffer);
  });
});


  return router;
};
