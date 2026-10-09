const { PrismaClient } = require('@prisma/client');

// Instanciation unique du client Prisma pour interagir avec SQLite
const prisma = new PrismaClient();

// Exportation de l'instance pour la réutiliser dans les contrôleurs
module.exports = prisma;