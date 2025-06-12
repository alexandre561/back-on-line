const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configuration du transport Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ngambalip11@gmail.com',
    pass: 'rgvv ngsk zzdy tezs' // Mot de passe d'application Gmail
  }
});

module.exports = (db) => {
  router.post('/enregistrer-candidature', upload.single('cv'), (req, res) => {
    const {
      nom,
      prenom,
      niveau_etude_id,
      domaine_id,
      date_naissance,
      tel,
      email,
      adresse,
      stage_id,
      lettre_motivation,
      image_candidat // ✅ Nouveau champ pour l'image texte
    } = req.body;

    const cvBuffer = req.file?.buffer;

    if (!cvBuffer) {
      return res.status(400).json({ message: "Le CV est requis." });
    }

    const codeUnique = uuidv4().split('-')[0].toUpperCase();
    const statutEnAttente = 6; // Statut "en attente"

    // Insertion dans la table Candidat
    const candidatQuery = `
      INSERT INTO candidat 
      (nom, prenom, niveau_etude_id, domaine_id, date_naissance, tel, email, adresse, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const candidatValues = [
      nom,
      prenom,
      niveau_etude_id,
      domaine_id,
      date_naissance,
      tel,
      email,
      adresse,
      image_candidat || null // ✅ Stocke l'URL ou null si vide
    ];

    db.query(candidatQuery, candidatValues, (err, result) => {
      if (err) {
        console.error('❌ Erreur lors de l\'insertion dans Candidat:', err);
        return res.status(500).json({ message: 'Erreur enregistrement candidat', error: err });
      }

      const candidatId = result.insertId;

      // Insertion dans Soumission
      const soumissionQuery = `
        INSERT INTO soumission 
        (candidat_id, stage_id, date_soumission, statut_id, cv, lettre_motivation, code_unique)
        VALUES (?, ?, NOW(), ?, ?, ?, ?)
      `;

      db.query(
        soumissionQuery,
        [candidatId, stage_id, statutEnAttente, cvBuffer, lettre_motivation, codeUnique],
        (err, result) => {
          if (err) {
            console.error('❌ Erreur lors de l\'insertion dans Soumission:', err);
            return res.status(500).json({ message: 'Erreur enregistrement soumission', error: err });
          }
          const appBaseUrl = 'http://10.10.2.70:3000'; // 🔁 À personnaliser
          const suiviUrl = `${appBaseUrl}?code=${codeUnique}`;
          
          // Préparation de l'email
  const mailOptions = {
  from: 'ngambalip11@gmail.com',
  to: email,
  subject: 'MUCODEC - Confirmation de votre candidature',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        :root {
          --mucodec-blue: #0056b3;
          --mucodec-red: #d32f2f;
          --mucodec-dark: #003366;
          --mucodec-light: #f8f9fa;
        }
        body {
          font-family: 'Montserrat', 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 650px;
          margin: 0 auto;
          padding: 0;
          background-color: var(--mucodec-light);
        }
        .email-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 25px rgba(0,0,0,0.08);
          margin: 20px auto;
        }
        .header {
          background: linear-gradient(135deg, var(--mucodec-dark), var(--mucodec-blue));
          padding: 30px 20px;
          text-align: center;
          position: relative;
          color: white;
        }
        .header::after {
          content: "";
          position: absolute;
          bottom: -15px;
          left: 0;
          right: 0;
          height: 30px;
          background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="white"/></svg>');
          background-size: cover;
        }
        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 15px;
        }
        .logo {
          height: 50px;
          width: auto;
        }
        .header-title {
          font-size: 22px;
          font-weight: 700;
          margin: 10px 0 5px;
          letter-spacing: 0.5px;
        }
        .header-subtitle {
          font-size: 14px;
          opacity: 0.9;
          font-weight: 300;
        }
        .content {
          padding: 40px 30px;
        }
        h1 {
          color: var(--mucodec-dark);
          font-size: 26px;
          margin-top: 0;
          position: relative;
          padding-bottom: 15px;
        }
        h1::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 3px;
          background: var(--mucodec-red);
        }
        p {
          margin-bottom: 20px;
          font-size: 15px;
        }
        .highlight-name {
          color: var(--mucodec-blue);
          font-weight: 600;
        }
        .code-container {
          background: linear-gradient(to right, #f8f9fa, #fff);
          border-left: 4px solid var(--mucodec-red);
          padding: 20px;
          margin: 25px 0;
          border-radius: 0 8px 8px 0;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .code-icon {
          color: var(--mucodec-red);
          font-size: 24px;
          flex-shrink: 0;
        }
        .code-value {
          font-family: 'Courier New', monospace;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 1px;
          color: var(--mucodec-dark);
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .track-button {
          display: inline-block;
          padding: 15px 35px;
          background: linear-gradient(135deg, var(--mucodec-blue), var(--mucodec-dark));
          color: white !important;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 15px rgba(0,86,179,0.2);
          transition: all 0.3s ease;
        }
        .track-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,86,179,0.3);
        }
        .link-alternative {
          font-size: 13px;
          color: #666;
          text-align: center;
          display: block;
          margin-top: 10px;
          word-break: break-all;
        }
        .footer {
          background: var(--mucodec-dark);
          color: white;
          padding: 30px;
          text-align: center;
          font-size: 13px;
          position: relative;
        }
        .footer::before {
          content: "";
          position: absolute;
          top: -15px;
          left: 0;
          right: 0;
          height: 30px;
          background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="%23003366" transform="rotate(180 600 60)"/></svg>');
          background-size: cover;
        }
        .footer-logo {
          height: 40px;
          margin-bottom: 15px;
          opacity: 0.8;
        }
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 15px 0;
          flex-wrap: wrap;
        }
        .footer-link {
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          transition: color 0.3s;
        }
        .footer-link:hover {
          color: white;
          text-decoration: underline;
        }
        .footer-address {
          margin: 15px 0;
          line-height: 1.7;
          opacity: 0.8;
          font-style: normal;
        }
        .footer-copyright {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid rgba(255,255,255,0.1);
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header MUCODEC -->
        <div class="header">
          <div class="logo-container">
            <!-- Remplacez par le vrai logo MUCODEC -->
            <img src="/12.png" alt="MUCODEC" class="logo">
          </div>
          <div class="header-title">MUCODEC Du CONGO</div>
          <div class="header-subtitle">Mutuelles Congolaise D'epargne et de Crédit</div>
        </div>
        
        <!-- Contenu principal -->
        <div class="content">
          <h1>Confirmation de candidature</h1>
          
          <p>Bonjour <span class="highlight-name">${prenom}</span>,</p>
          
          <p>Nous accusons réception de votre candidature pour le stage à la <strong>MUCODEC Congo</strong> et vous remercions pour l'intérêt que vous portez à notre institution.</p>
          
          <p>Votre dossier a été enregistré sous la référence suivante :</p>
          
          <div class="code-container">
            <div class="code-icon">✉️</div>
            <div class="code-value">${codeUnique}</div>
          </div>
          
          <p>Ce code unique vous permettra de suivre l'évolution de votre candidature à tout moment.</p>
          
          <div class="button-container">
            <a href="${suiviUrl}" class="track-button">SUIVRE MA CANDIDATURE</a>
            <span class="link-alternative">${suiviUrl}</span>
          </div>
          
          <p>Notre équipe des ressources humaines traitera votre demande dans les meilleurs délais. Vous recevrez une notification à chaque étape importante du processus.</p>
          
          <p>Pour toute question, n'hésitez pas à répondre à cet email.</p>
        </div>
        
        <!-- Footer MUCODEC -->
        <div class="footer">
          <img src="/12.png" alt="MUCODEC" class="footer-logo">
          
          <div class="footer-links">
            <a href="https://mucodec.cg" class="footer-link">Site Web</a>
            <a href="tel:+242065432765" class="footer-link">Contact</a>
            <a href="https://facebook.com/mucodec" class="footer-link">Facebook</a>
            <a href="https://linkedin.com/company/mucodec" class="footer-link">LinkedIn</a>
          </div>
          
          <div class="footer-address">
            MUCODEC Congo<br>
            Avenue de la Révolution, Brazzaville<br>
            République du Congo
          </div>
          
          <div class="footer-copyright">
            &copy; ${new Date().getFullYear()} MUCODEC Congo - Tous droits réservés
          </div>
        </div>
      </div>
    </body>
    </html>
  `
};

          // Envoi de l'email
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('⚠️ Erreur lors de l\'envoi de l\'email:', error);
              // On continue sans bloquer la réponse
            } else {
              console.log('📧 E-mail envoyé :', info.response);
            }
          });

          // Réponse finale
          return res.status(200).json({
            message: '✅ Candidature enregistrée avec succès. Vérifiez votre email.',
            code: codeUnique,
            candidatId,
            soumissionId: result.insertId
          });
        }
      );
    });
  });

  return router;
};
