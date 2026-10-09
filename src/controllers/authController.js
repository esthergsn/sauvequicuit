const bcrypt = require('bcrypt');
const prisma = require('../config/db'); // Connexion SQLite centralisée
const jwt = require('jsonwebtoken');

// Fonction utilitaire pour tester la robustesse du mot de passe (OWASP)
function testMotDePasseFort(password) {
  // Exige : 14+ caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{14,}$/;
  return regex.test(password);
}

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
  const { pseudo, email, password } = req.body;

  // 1. Validation de sécurité côté serveur
  if (!testMotDePasseFort(password)) {
    return res.status(400).json({ 
      error: "Le mot de passe doit faire au moins 14 caractères, contenir 1 majuscule, 1 chiffre et 1 caractère spécial." 
    });
  }

  try {
    // 2. Hachage sécurisé avec Salt (facteur de travail 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insertion de l'utilisateur en base de données
    const user = await prisma.user.create({
      data: { pseudo, email, password: hashedPassword }
    });
    
    // 4. Réponse sans renvoyer le mot de passe
    res.status(201).json({ 
      message: "Utilisateur créé avec succès !",
      user: { id: user.id, pseudo: user.pseudo, email: user.email }
    });
  } catch (err) {
    // Gestion du doublon sur l'email unique
    res.status(400).json({ error: "Email déjà utilisé ou données invalides." });
  }
};

// Connexion d'un utilisateur existant
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Recherche de l'utilisateur par son email dans la BDD
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Si l'utilisateur n'existe pas
    if (!user) {
      return res.status(400).json({ error: "Email ou mot de passe incorrect." });
    }

    // 2. Vérification du mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Email ou mot de passe incorrect." });
    }

    // 3. Génération du jeton JWT sécurisé
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Succès de la connexion : renvoie du token et des infos publiques
    res.status(200).json({
      message: "Connexion réussie !",
      token: token,
      user: { id: user.id, pseudo: user.pseudo, email: user.email }
    });

  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la connexion." });
  }
};