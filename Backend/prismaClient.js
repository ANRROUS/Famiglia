import { PrismaClient } from '@prisma/client'

// Evita múltiples instancias en modo dev
const globalForPrisma = globalThis

// Config para desactivar prepared statements
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?pgbouncer=true&connection_limit=1&prepared_statements=false',
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
})

// Evita recrearlo en cada recarga
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Fix para BigInt → JSON
BigInt.prototype.toJSON = function () {
  return this.toString()
}

export default prisma
