const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  router.get('/:id', (req, res) => {
    const demandeId = req.params.id;
    console.log(`[LOG] Requête courrier pour id = ${demandeId}`);

    const query = 'SELECT courrier FROM demande WHERE id = ?';

    db.query(query, [demandeId], (err, results) => {
      if (err) {
        console.error("[ERREUR] lors de la récupération du courrier :", err);
        return res.status(500).send("Erreur serveur.");
      }

      if (!results.length || !results[0].courrier) {
        console.warn(`[WARN] Courrier non trouvé pour id = ${demandeId}`);
        return res.status(404).send("Courrier non trouvé.");
      }

      const courrierBuffer = results[0].courrier;

      console.log(`[LOG] Envoi du courrier PDF pour id = ${demandeId}, taille du buffer = ${courrierBuffer.length} octets`);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="courrier_${demandeId}.pdf"`,
      });
      res.send(courrierBuffer);
    });
  });

  return router;
};
