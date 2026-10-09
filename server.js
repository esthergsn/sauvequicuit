// server.js
require('dotenv').config(); // charge les variable d'environnement
const express = require('express');
const helmet = require('helmet'); // Import Helmet pour la sécu

const app = express();

app.use(express.json());
app.use(express.static('public'));

// securisation des en-têtes HTTP avec Helmet
app.use(helmet({
  contentSecurityPolicy: false //desactiver pour éviter de bloquer les scripts/styles locaux en dev
}));

app.use(express.json());
app.use(express.static('public'));

// on importe les routes separer
const authRoutes = require('./src/routes/authRoutes');
const recipeRoutes = require('./src/routes/recipeRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:3000`);
});