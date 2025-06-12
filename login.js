const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Connexion d'un recruteur
  router.post('/login', (req, res) => {
    const { email, password } = req.body;

    console.log('🔐 Tentative de connexion...');
    console.log('➡️ Email reçu :', email);
    console.log('➡️ Password reçu :', password ? '[PROVIDED]' : '[EMPTY]');

    if (!email || !password) {
      console.warn('⚠️ Email ou mot de passe manquant');
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const query = 'SELECT * FROM recruteur WHERE email = ? LIMIT 1';
    db.query(query, [email], (err, results) => {
      if (err) {
        console.error('❌ Erreur SQL :', err);
        return res.status(500).json({ message: 'Erreur serveur', error: err });
      }

      console.log('📦 Résultat de la requête SQL :', results);

      if (results.length === 0) {
        console.warn('❌ Recruteur non trouvé pour email :', email);
        return res.status(401).json({ message: 'Recruteur non trouvé' });
      }

      const user = results[0];

      // ⚠️ Attention : le champ dans la table s'appelle 'passwor'
      if (user.password === password) {
        console.log('✅ Connexion réussie pour :', email);
        return res.status(200).json({
          message: 'Connexion réussie',
          user: {
            id: user.id,
            email: user.email
          }
        });
      } else {
        console.warn('❌ Mot de passe incorrect pour :', email);
        return res.status(401).json({ message: 'Mot de passe incorrect' });
      }
    });
  });

  return router;
};
