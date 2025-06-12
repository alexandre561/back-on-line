const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 5000;

// Middlewares globaux - 1 seul appel à cors et express.json avec limite adaptée
app.use(cors());
app.use(express.json({ limit: '50mb' }));
require('dotenv').config();

// Connexion à la base de données
const db = mysql.createPool({
  host: process.env.DB_HOST,        // ex: crossover.proxy.rlwy.net
  port: process.env.DB_PORT,        // ex: 34004
  user: process.env.DB_USER,        // ex: root
  password: process.env.DB_PASSWORD,// ex: ton mot de passe Railway
  database: process.env.DB_NAME,    // ex: railway
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Erreur de connexion à la base de données :", err);
    process.exit(1);
  }
  console.log("✅ Connexion à la base de données réussie");
  connection.release(); // libère la connexion
});

// Importation des routes avec injection de la connexion (si nécessaire)
const domaineRoutes = require('./domaine')(db);
const niveauRoutes = require('./niveau')(db);
const soumissionRoutes = require('./candidature')(db);
const stageRoutes = require('./stage')(db);
const suiviCandidatureRoutes = require('./suiviCandidatureRoutes');
const suiviCandidatureRoutes2 = require('./suiviCandidatureRoutes2');
const serviceRoutes = require('./service');
const ajouterStageRoutes = require('./ajouterStage');
const listeStageRoutes = require('./listeStages');
const listeCandidatureRoutes = require('./listecandidature');
const statRoutes = require('./recruteurStats');
const candidatureValideRoutes = require('./candidatureValide');
const prolongerStageRoutes = require('./ProlongerStage');
const loginRoutes = require('./login');
const rechercheStageRoutes = require('./rechercheStage');
const updateStatutRoutes = require('./updateStatutStage');
const messengerRoutes = require('./messenger')(db);
const recruteurRoutes = require('./recruteur')(db);
const directionRoutes = require('./direction')(db);
const ajoutCandidature = require('./ajout-candidature');
const listeCandidature = require('./candidatureSpontanne');
const demande = require('./Demande');
const remboursementRoute = require('./remboursement');
const demandesRoutes = require('./listeDemande');
const courrierRoutes = require('./courier');
const demandesValidRoutes = require('./validationDemande');
const document = require('./send-signed-doc');
const domainCheckRoutes = require('./checkDomain');
// Application des routes sous le préfixe /api (avec injection si besoin)
app.use('/api', domaineRoutes);
app.use('/api', niveauRoutes);
app.use('/api', soumissionRoutes);
app.use('/api', stageRoutes);
app.use('/api', suiviCandidatureRoutes(db));
app.use('/api', serviceRoutes(db));
app.use('/api', ajouterStageRoutes(db));
app.use('/api', listeStageRoutes(db));
app.use('/api', listeCandidatureRoutes(db));
app.use('/api', statRoutes(db));
app.use('/api', candidatureValideRoutes(db));
app.use('/api', prolongerStageRoutes(db));
app.use('/api', loginRoutes(db));
app.use('/api', rechercheStageRoutes(db));
app.use('/api', updateStatutRoutes(db));
app.use('/api', messengerRoutes);
app.use('/api', recruteurRoutes);
app.use('/api', directionRoutes);
app.use('/uploads', express.static('uploads')); // Pour accéder aux fichiers uploadés
app.use('/api', ajoutCandidature(db));
app.use('/api', listeCandidature(db));
app.use('/api', suiviCandidatureRoutes2(db));
app.use('/api', demande(db));
app.use('/api', remboursementRoute(db));
app.use('/api/liste-demandes', demandesRoutes(db));
app.use('/courrier', courrierRoutes(db));
app.use('/api', demandesValidRoutes(db));
app.use('/api', document(db));
app.use('/api/check-domain', domainCheckRoutes);
// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur lancé sur http://10.10.2.70:${port}`);
});
