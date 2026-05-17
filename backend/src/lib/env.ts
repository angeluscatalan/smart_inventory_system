const required = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGIN'] as const

for (const key of required) {
  if (!process.env[key]) {
    console.error(`[startup] Missing required environment variable: ${key}`)
    process.exit(1)
  }
}

export const DATABASE_URL = process.env.DATABASE_URL as string
export const JWT_SECRET = process.env.JWT_SECRET as string
export const CORS_ORIGIN = process.env.CORS_ORIGIN as string
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h'
