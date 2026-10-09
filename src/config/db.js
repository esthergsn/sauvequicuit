const { PrismaClient } = require('@prisma/client');

// instanciation unique du client prisma pour interagir avec SQLite
const prisma = new PrismaClient();

// Exportation de l'instance pour la réutiliser dans les contrôleurs
module.exports = prisma;