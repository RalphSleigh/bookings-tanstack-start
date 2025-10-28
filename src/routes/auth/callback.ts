import { getConfig } from '@/server/config'
import { createFileRoute, redirect } from '@tanstack/react-router'
import jwksClient from 'jwks-rsa'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { userRepo } from '@/server/firestore'
import { admin, auth } from '@googleapis/admin'
import { TUser, UserSchema } from '@/schemas/user'
import { getAuthClientForScope } from '@/server/serviceAccountAuth'
import { v7 as uuidv7 } from 'uuid'
import { useAppSession } from '@/server/session'

export const Route = createFileRoute('/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          //const logToPath = res.locals.logger.logToPath.bind(res.locals.logger)
          //const logToSystem = res.locals.logger.logToSystem.bind(res.locals.logger)

          const config = await getConfig()
          const url = new URL(request.url)
          const code = url.searchParams.get('code') as string | undefined

          const token = await fetch(
            `https://${config.AUTH0_DOMAIN}/oauth/token`,
            {
              method: 'POST',
              headers: { 'content-type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: config.AUTH0_CLIENT_ID,
                client_secret: config.AUTH0_CLIENT_SECRET,
                code: code!,
                redirect_uri: config.BASE_URL,
              }),
            },
          )

          const profileJson = await token.json()

          const client = jwksClient({
            jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`,
          })

          const kid = jwt.decode(profileJson.id_token, { complete: true })
            ?.header.kid
          const key = await client.getSigningKey(kid!)
          const pubKey = key.getPublicKey()

          const profile = jwt.verify(profileJson.id_token, pubKey, {
            algorithms: ['RS256'],
          }) as JwtPayload

          if (profile === undefined || profile.sub === undefined) {
            return new Response('Unauthorized', { status: 401 })
          }

          const userResult = await userRepo.findByField('sub', profile.sub)
          console.log('USER RESULT:', userResult)

          //const userResult = await DBUser.get({ sub: profile.sub! }).go()
          let user: TUser

          //res.locals.logger.logToPath('PROFILE')
          //res.locals.logger.logToPath(profile)

          if (userResult.length === 0) {
            const [source, sub] = profile.sub!.split('|')

            let isWoodcraft = false
            let isisWoodcraftGroupUser = false
            let displayName = profile.name
            let email = profile.email

            if (source === 'google-oauth2') {
              const oauth2Client = await getAuthClientForScope([
                'https://www.googleapis.com/auth/admin.directory.user.readonly',
              ])

              try {
                const directory = admin({
                  version: 'directory_v1',
                  auth: oauth2Client,
                })
                const user = await directory.users.get({
                  userKey: sub,
                })
                isWoodcraft = true
                isisWoodcraftGroupUser = !!user.data.orgUnitPath
                  ?.toLocaleLowerCase()
                  .includes('groups-and-districts')
                displayName = user.data.name?.fullName
                email = user.data.primaryEmail
              } catch (e) {
                console.log(e)
                //res.locals.logger.logToPath(e)
              }
            }
            const newUserData = {
              id: uuidv7(),
              sub: profile.sub!,
              email: email,
              name: displayName,
              avatar: profile.picture,
              isWoodcraft: isWoodcraft,
              isGroupAccount: isisWoodcraftGroupUser,
            }

            const createData = UserSchema.parse(newUserData)

            const createResult = await userRepo.create(createData)

            user = UserSchema.parse(createResult)

            if (config.ENV === 'dev' && user.isWoodcraft) {
              //await DBRole.create({ roleId: uuidv7(), userId: user.userId, role: 'admin' }).go()
            }

            //logToSystem(`New user created: ${JSON.stringify(user)}`)
          } else {
            user = UserSchema.parse(userResult[0])
            //logToSystem(`User found: ${JSON.stringify(user)}`)
          }

          console.log('FINAL USER:', user)
          //res.locals.logger.logToPath(user)

          const session = await useAppSession()
          await session.update({ userId: user.id })

          return Response.redirect(config.BASE_URL)

          /*     const jwt_token = jwt.sign({ id: user.userId }, config.JWT_SECRET, {
      expiresIn: 1000 * 60 * 60 * config.COOKIE_EXPIRY,
    })
    const cookie_string = cookie.serialize('jwt', jwt_token, {
      maxAge: 60 * 60 * config.COOKIE_EXPIRY,
      httpOnly: true,
      sameSite: true,
      path: '/',
    })

    res.cookie('jwt', jwt_token, {
      maxAge: 60 * 60 * config.COOKIE_EXPIRY * 1000,
      httpOnly: true,
      sameSite: true,
    }) */

          /* if(req.cookies.redirect) {
      res.clearCookie('redirect', { path: '/' })
      res.redirect(req.cookies.redirect as string)
      return
    }

    res.redirect(config.BASE_URL)
    */
        } catch (error) {
          console.error('Error in auth callback:', error)
          /* res.locals.logger.logToPath('Error in auth callback')
    res.locals.logger.logToPath(error)
    res.status(500).send('Internal Server Error') */
        }
      },
    },
  },
})
