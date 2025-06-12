const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ngambalip11@gmail.com',
    pass: 'rgvv ngsk zzdy tezs' // ⚠️ à sécuriser avec .env
  }
});

// ✅ Export sous forme de fonction prenant `db`
module.exports = (db) => {
  const router = express.Router();

  router.post('/ajout-candidature', upload.single('cv'), (req, res) => {
    const {
      nom,
      prenom,
      email,
      dateNaissance,
      telephone,
      adresse,
      domaineEtudes,
      niveauEtudes,
      lettreMotivation,
      imageUrl
    } = req.body;

    const cvBuffer = req.file?.buffer;
    if (!cvBuffer) {
      return res.status(400).json({ message: 'Le CV est requis.' });
    }

    const cvFileName = req.file.originalname;
    const codeUnique = uuidv4().split('-')[0].toUpperCase();
    const statut = 'En attente';

    const query = `
      INSERT INTO candidature (
        nom, prenom, email, date_naissance, telephone, adresse,
        domaine_etudes, niveau_etudes, lettre_motivation,
        cv_filename, cv_blob, image_url, code, statut
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nom,
      prenom,
      email,
      dateNaissance,
      telephone,
      adresse,
      domaineEtudes || null,
      niveauEtudes || null,
      lettreMotivation,
      cvFileName,
      cvBuffer,
      imageUrl || null,
      codeUnique,
      statut
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error('Erreur en base:', err);
        return res.status(500).json({ message: 'Erreur serveur', error: err });
      }

      const appBaseUrl = 'http://10.10.2.70:3000';
      const suiviUrl = `${appBaseUrl}?code=${codeUnique}`;

      const mailOptions = {
        from: 'ngambalip11@gmail.com',
        to: email,
        subject: 'Confirmation de votre candidature',
        html: `
          <p>Bonjour ${prenom},</p>
          <p>Merci pour votre candidature.</p>
          <p><strong>✅ Votre code de suivi :</strong> ${codeUnique}</p>
          <p>Suivez l'état de votre candidature en cliquant sur le lien ci-dessous :</p>
          <p><a href="${suiviUrl}" style="padding:10px 15px; background-color:#007bff; color:white; text-decoration:none; border-radius:4px;">Suivre ma candidature</a></p>
          <p>Ou copiez-collez ce lien dans votre navigateur :<br>${suiviUrl}</p>
          <p>Cordialement,<br>L'équipe de recrutement</p>
        `
      };

      transporter.sendMail(mailOptions, (emailErr, info) => {
        if (emailErr) {
          console.error("Erreur lors de l'envoi de l'email :", emailErr);
        } else {
          console.log("Email envoyé :", info.response);
        }
      });

      return res.status(200).json({
        message: 'Candidature enregistrée avec succès. Vérifiez votre email.',
        code: codeUnique
      });
    });
  });

  return router; // ✅ En dehors de la route
};
