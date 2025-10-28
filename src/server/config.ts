import { createServerOnlyFn } from "@tanstack/react-start"
import { ParameterManagerClient } from "@google-cloud/parametermanager"

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
  BASE_URL: string,
  EMAIL_ENABLED: boolean,
  DISCORD_ENABLED: boolean,
  DISCORD_WEBHOOK_URL: string,
}

export const getConfig: () => Promise<AppConfigType> = createServerOnlyFn(async () => {
  if(process.env.IN_CONTAINER === 'true') {
    const client = new ParameterManagerClient()
    const parameters = await client.renderParameterVersion({
      name: 'config',
    })

    console.log(JSON.stringify(parameters[0], null, 2))
  
    return parameters[0] as AppConfigType

  } else {
    return await import('../../config.json') as AppConfigType
  }
})
