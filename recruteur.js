// routes/messenger.js
const express = require('express');
const router = express.Router();

// Récupérer le recruteur
module.exports = (db) => {
  // 🔹 1. Récupérer le recruteur (fixe ou dynamique)
  router.get('/recruteur', (req, res) => {
    const query = 'SELECT id, email FROM recruteur WHERE id = 1'; // ou dynamique selon la session

    db.query(query, (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération du recruteur :', err);
        return res.status(500).json({ message: 'Erreur serveur', error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Recruteur non trouvé' });
      }

      res.json(results[0]);
    });
  });

  // 🔹 2. Récupérer les candidats ayant postulé
 router.get('/candidats', (req, res) => {
  const query = `
    SELECT DISTINCT c.id, c.nom, c.prenom, c.email
    FROM candidat c
    INNER JOIN soumission s ON s.candidat_id = c.id

    UNION

    SELECT DISTINCT ca.id, ca.nom, ca.prenom, ca.email
    FROM candidature ca
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des candidats :', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    res.json(results); // tableau [{ id, nom, prenom, email }]
  });
});

  // 🔹 3. Récupérer les messages entre un candidat et un recruteur
  router.get('/messages/:candidatId/:recruteurId', (req, res) => {
    const { candidatId, recruteurId } = req.params;

    const query = `
      SELECT m.id, m.message, m.created_at, m.sender_type 
      FROM messages m
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
      OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `;

    db.query(query, [candidatId, recruteurId, recruteurId, candidatId], (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des messages :', err);
        return res.status(500).json({ message: 'Erreur serveur', error: err });
      }

      res.json(results); // Tableau de messages
    });
  });

  // 🔹 4. Envoi de messages entre le candidat et le recruteur
  router.post('/messages', (req, res) => {
    const { sender_id, receiver_id, sender_type, message } = req.body;

    if (!sender_id || !receiver_id || !sender_type || !message) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const query = `
      INSERT INTO messages (sender_id, receiver_id, sender_type, message, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;

    db.query(query, [sender_id, receiver_id, sender_type, message], (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'envoi du message :', err);
        return res.status(500).json({ message: 'Erreur serveur', error: err });
      }

      // Retourner le message inséré
      const newMessage = {
        id: results.insertId,
        sender: sender_type === 'candidat' ? 'user' : 'contact',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      res.json(newMessage);
    });
  });

  return router;
};
