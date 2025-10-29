import { createServerOnlyFn } from '@tanstack/react-start'
import { ParameterManagerClient } from '@google-cloud/parametermanager'
import NodeCache from 'node-cache'

export type AppConfigType = {
  AUTH0_CLIENT_SECRET: string
  AUTH0_CLIENT_ID: string
  AUTH0_DOMAIN: string
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string
  GOOGLE_IDENTITY_POOL_AUDIENCE: string
  GOOGLE_WORKSPACE_EMAIL: string
  JWT_SECRET: string
  ENV: 'dev' | 'prod'
  COOKIE_EXPIRY: number
  BASE_URL: string
  EMAIL_ENABLED: boolean
  DISCORD_ENABLED: boolean
  DISCORD_WEBHOOK_URL: string
}

const importWithoutVite = (path: string) => import(/* @vite-ignore */ path)

const toNumber = (value: string | number | Long | null | undefined): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseInt(value, 10)
  if (value && 'toNumber' in value) return value.toNumber()
  return 0
}

const configCache = new NodeCache({ useClones: false })

export const getConfig: () => Promise<AppConfigType> = createServerOnlyFn(
  async () => {
    if (process.env.IN_CONTAINER === 'true') {
      const cachedConfig = configCache.get<AppConfigType>('appConfig')

      if (cachedConfig) {
        console.log('Using cached config')
        return cachedConfig
      }

      console.log('Fetching config from Parameter Manager')

      const client = new ParameterManagerClient()

      const parameterName = `projects/${process.env.GOOGLE_CLOUD_PROJECT}/locations/global/parameters/config`
      const versions = await client.listParameterVersions({
        parent: parameterName,
      })

      const latestVersion = versions[0].sort(
        (a, b) =>
          toNumber(b.updateTime?.seconds) - toNumber(a.updateTime?.seconds),
      )[0]
      
      const parameters = await client.renderParameterVersion({
        name: latestVersion.name!,
      })

      if (!parameters[0].renderedPayload) {
        throw new Error('Failed to fetch parameter')
      }

      const config = JSON.parse(
        parameters[0].renderedPayload.toString(),
      ) as AppConfigType

      configCache.set('appConfig', config, 300) // Cache for 5 minutes

      return config
    } else {
      // this only exists for local development
      return (await importWithoutVite('../../config.json')) as AppConfigType
    }
  },
)
