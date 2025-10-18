import { PrismaClient } from '@prisma/client'

// Configurar BigInt para serialización JSON
BigInt.prototype.toJSON = function() {
    return this.toString()
}

// Singleton pattern para evitar múltiples instancias
const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma