import { getConfig } from '@/server/config'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/redirect')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const config = await getConfig()
        const url = new URL(request.url)
        const shouldSwitch = url.searchParams.get('switch') === 'true'
        const redirect_url = `https://${config.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${config.AUTH0_CLIENT_ID}&redirect_uri=${config.BASE_URL}/auth/callback&scope=openid profile email&state=123${shouldSwitch ? '&prompt=login' : ''}`
        /*  res.cookie('redirect', req.query.redirect || '/', { maxAge: 10 * 60 * 1000, httpOnly: true, path: '/' })
  res.redirect(redirect_url) */
        //cookie('redirect', request.query.redirect || '/', { maxAge: 10 * 60 * 1000, httpOnly: true, path: '/' })
        return Response.redirect(redirect_url)
      },
    },
  },
})
