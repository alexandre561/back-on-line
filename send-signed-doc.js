const express = require('express');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.use(express.json({ limit: '10mb' }));

// Configuration Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ngambalip11@gmail.com',
    pass: 'rgvv ngsk zzdy tezs' // À sécuriser dans un .env
  }
});

// Vérification SMTP
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Erreur SMTP:', error);
  } else {
    console.log('✅ SMTP prêt à envoyer des emails.');
  }
});

module.exports = (db) => {
  router.post('/send-signed-doc', async (req, res) => {
    try {
      console.log('[send-signed-doc] Requête reçue');

      const { email, pdfBase64, id_stagiaire, filename = 'document-signe.pdf' } = req.body;

      if (!email || !pdfBase64 || !id_stagiaire) {
        return res.status(400).json({ message: 'Email, document PDF et id_stagiaire sont requis' });
      }

      // Génération du code de suivi
      const codeSuivi = uuidv4();
      console.log(`[send-signed-doc] Génération code de suivi : ${codeSuivi}`);

      // Mise à jour du code de suivi dans Demande via id_stagiaire
      const [updateResult] = await db.promise().query(
        `UPDATE Demande SET code_suivi = ? WHERE id_stagiaire = ?`,
        [codeSuivi, id_stagiaire]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: `Aucune demande trouvée pour le stagiaire ID : ${id_stagiaire}` });
      }

      // Préparation de la pièce jointe
      const attachment = {
        filename,
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf'
      };

      // Configuration de l'email
      const mailOptions = {
        from: 'ngambalip11@gmail.com',
        to: email,
        subject: 'Votre document signé & code de suivi',
        text: `Bonjour,\n\nVeuillez trouver ci-joint votre document signé.\nVotre code de suivi est : ${codeSuivi}\n\nCordialement.`,
        attachments: [attachment]
      };

      await transporter.sendMail(mailOptions);

      console.log(`[send-signed-doc] Document envoyé à ${email} avec code de suivi.`);
      return res.status(200).json({ message: 'Document envoyé avec succès.', codeSuivi });

    } catch (error) {
      console.error('[send-signed-doc] Erreur :', error);
      return res.status(500).json({ message: 'Erreur serveur lors de l\'envoi du document.' });
    }
  });

  return router;
};
