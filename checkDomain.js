const express = require('express');
const axios = require('axios');
const router = express.Router();

async function checkDomain(domain) {
  try {
    const response = await axios.get(`https://www.freenom.com/fr/index.html?query=${domain}`);
    const isAvailable = response.data.includes("Le nom de domaine est disponible");
    return isAvailable;
  } catch (err) {
    console.error('Erreur', err);
    throw err;
  }
}

router.get('/:domain', async (req, res) => {
  const domain = req.params.domain;
  try {
    const available = await checkDomain(domain);
    res.json({ domain, available });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
