import mongoose from 'mongoose'
import dns from 'node:dns'

// Some local/ISP resolvers refuse the SRV lookup Atlas needs (querySrv
// ECONNREFUSED). Point Node at public DNS so mongodb+srv:// resolves reliably.
dns.setServers(['8.8.8.8', '1.1.1.1'])

/** Connect once, with a clear error if the URI is missing or wrong. */
export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy server/.env.example to server/.env.')
  }
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  console.log('✓ MongoDB connected')
}
