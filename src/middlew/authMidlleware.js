const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Récupération du header 'Authorization' (ex: "Bearer eyJhbGciOi...")
  const authHeader = req.headers['authorization'];
  
  // Extraire le token en séparant "Bearer" du jeton lui-même
  const token = authHeader && authHeader.split(' ')[1];

  // 2. Si aucun token n'est fourni, on bloque la requête
  if (!token) {
    return res.status(401).json({ error: "Accès refusé. Jeton d'authentification manquant." });
  }

  try {
    // 3. Vérification de la validité et de la signature du jeton via la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attache les informations décodées de l'utilisateur à l'objet de requête (req)
    req.user = decoded;
    
    // 4. Passe la main au contrôleur suivant
    next();
  } catch (err) {
    // Si le jeton est expiré ou falsifié
    return res.status(403).json({ error: "Jeton invalide ou expiré." });
  }
};