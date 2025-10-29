import { getConfig } from '@/server/config'
import { useSession } from '@tanstack/react-start/server'

type SessionData = {
  userId?: string
}

export async function useAppSession() {
  const config = await getConfig()

  return useSession<SessionData>({
    // Session configuration
    name: '__session',
    password: config.JWT_SECRET,
    // Optional: customize cookie settings
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
  })
}