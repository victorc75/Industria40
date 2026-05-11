/** @type {import('next').NextConfig} */
const nextConfig = {
  // Para comprobar en login que Vercel desplegó el commit correcto (VERCEL_* lo inyecta Vercel en build).
  env: {
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA || '',
  },
}

module.exports = nextConfig
