const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer configuration pour buffer en mémoire (pas besoin d'écrire sur disque)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // max 5 Mo
});

module.exports = (db) => {
  // Vérifier un code de remboursement
  router.get('/verifier-remboursement/:code', (req, res) => {
    const code = req.params.code;

    console.log(`📥 Reçu une requête de vérification pour le code : ${code}`);

    const query = `
      SELECT 
        c.*, 
        s.libele AS statut 
      FROM soumission c
      JOIN statut s ON c.statut_id = s.id
      WHERE c.code_unique = ? AND (s.libele = 'Validé' OR s.libele = 'Prolongé')
      LIMIT 1
    `;

    db.query(query, [code], (err, results) => {
      if (err) {
        console.error('❌ Erreur lors de l\'exécution de la requête SQL :', err);
        return res.status(500).json({ message: "Erreur du serveur", error: err });
      }

      console.log(`🔍 Résultat de la requête pour le code ${code} :`, results);

      if (results.length === 0) {
        console.warn(`⚠️ Aucun enregistrement trouvé pour le code : ${code}`);
        return res.status(404).json({ message: "Code invalide ou statut non éligible pour remboursement." });
      }

      const soumission = results[0];

      console.log(`✅ Code ${code} vérifié avec succès. Statut : ${soumission.statut}`);
      res.json({
        message: "Code vérifié avec succès",
        data: soumission // contient tous les champs de Soumission + statut
      });
    });
  });

  router.get('/suivi-remboursement/:code', (req, res) => {
    const rawCode = req.params.code;

    // Nettoyer le code reçu (trim + lowercase) pour éviter les erreurs de comparaison
    const code = rawCode.trim().toLowerCase();

    console.log(`📥 Vérification du code de suivi dans Demande : '${rawCode}' (nettoyé : '${code}')`);

    const query = `
      SELECT 
        d.*, 
        sd.libelle AS statut
      FROM Demande d
      LEFT JOIN statut_demande sd ON d.id_statut = sd.id
      WHERE LOWER(TRIM(d.code_suivi)) = ?
      LIMIT 1
    `;

    db.query(query, [code], (err, results) => {
      if (err) {
        console.error("❌ Erreur SQL lors de la vérification du code_suivi dans Demande :", err);
        return res.status(500).json({ message: "Erreur du serveur", error: err });
      }

      console.log(`🔍 Résultat pour le code_suivi '${code}' dans Demande :`, results);

      if (results.length === 0) {
        console.warn(`⚠️ Aucun enregistrement Demande trouvé pour le code_suivi : '${code}'`);
        return res.status(404).json({ message: "Code de suivi invalide ou non éligible." });
      }

      const demande = results[0];

      console.log(`✅ Code de suivi '${code}' trouvé dans Demande avec statut : '${demande.statut}'`);
      res.json({
        message: "Code de suivi vérifié avec succès",
        data: demande // tous champs de Demande + libelle statut
      });
    });
  });

  router.post('/suivi-remboursement/:code/envoi-cra', upload.single('fichierPdf'), (req, res) => {
  const code = req.params.code.trim().toLowerCase();
  const texteCra = req.body.texteCra;
  const fichier = req.file;

  if (!texteCra || !fichier) {
    return res.status(400).json({ message: 'Texte CRA et fichier PDF sont requis.' });
  }

  console.log(`📩 Réception CRA pour code ${code} : texte CRA = ${texteCra}, fichier PDF reçu (${fichier.size} bytes)`);

  // Mettre à jour la demande avec le CRA, le PDF, et le statut = verification-vv (id = 3)
  const queryUpdate = `
    UPDATE Demande 
    SET cra = ?, niu_livret = ?, id_statut = 3 
    WHERE LOWER(TRIM(code_suivi)) = ?
  `;

  db.query(queryUpdate, [texteCra, fichier.buffer, code], (err, result) => {
    if (err) {
      console.error('❌ Erreur SQL lors de la mise à jour du CRA:', err);
      return res.status(500).json({ message: 'Erreur serveur lors de l\'enregistrement du CRA.' });
    }

    if (result.affectedRows === 0) {
      console.warn(`⚠️ Aucun enregistrement trouvé avec code_suivi = ${code}`);
      return res.status(404).json({ message: 'Code de suivi introuvable.' });
    }

    console.log(`✅ CRA, PDF et statut 'verification-vv' enregistrés pour le code_suivi ${code}`);
    return res.json({ message: 'CRA, PDF et statut mis à jour avec succès.' });
  });
});

// 🔍 Récupère les demandes en statut 'verification-vv' avec les infos du candidat
router.get('/suivi/en-attente-vv', (req, res) => {
  const query = `
    SELECT 
      d.*, 
      sd.libelle AS statut_demande,
      s.nom, s.prenom, s.email, s.date_naissance, s.telephone, s.adresse, 
      s.domaine_etudes, s.niveau_etude_id, s.domaine_id, s.tel, s.image
    FROM Demande d
    LEFT JOIN statut_demande sd ON d.id_statut = sd.id
    LEFT JOIN Candidat s ON d.id_stagiaire = s.id
    WHERE d.id_statut = 3
    ORDER BY d.date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Erreur SQL lors de la récupération des demandes à vérifier :", err);
      return res.status(500).json({ message: "Erreur serveur lors de la récupération des demandes." });
    }

    console.log(`📄 ${results.length} demande(s) avec statut 'verification-vv' et infos stagiaire récupérées.`);
    res.json({
      message: "Demandes avec informations des candidats récupérées avec succès.",
      data: results
    });
  });
});

  return router;
};
