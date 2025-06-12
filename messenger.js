const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // 1. Récupérer tous les messages entre un candidat et un recruteur
  router.get('/messages/:candidatId/:recruteurId', (req, res) => {
    const { candidatId, recruteurId } = req.params;

    const query = `
      SELECT * FROM messages
      WHERE 
        (sender_id = ? AND sender_type = 'candidat' AND receiver_id = ?)
        OR
        (sender_id = ? AND sender_type = 'recruteur' AND receiver_id = ?)
      ORDER BY created_at ASC
    `;

    db.query(query, [candidatId, recruteurId, recruteurId, candidatId], (err, results) => {
      if (err) {
        console.error('Erreur récupération des messages :', err);
        return res.status(500).json({ message: 'Erreur serveur', error: err });
      }

      res.json(results);
    });
  });

  // 2. Envoyer un message
  router.post('/messages', (req, res) => {
    const { sender_id, receiver_id, sender_type, message } = req.body;

    if (!sender_id || !receiver_id || !sender_type || !message) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const query = `
      INSERT INTO messages (sender_id, receiver_id, sender_type, message)
      VALUES (?, ?, ?, ?)
    `;

    db.query(query, [sender_id, receiver_id, sender_type, message], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'envoi du message :', err);
        return res.status(500).json({ message: 'Erreur d\'insertion', error: err });
      }

      res.status(201).json({ id: result.insertId, created_at: new Date().toISOString() });
    });
  });

  return router;
};
