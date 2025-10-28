import { getConfig } from '@/server/config'
import { IAMCredentialsClient } from '@google-cloud/iam-credentials'

import { AwsClient, GoogleAuth, OAuth2Client } from 'google-auth-library'

const GOOGLE_OAUTH2_TOKEN_API_URL = 'https://oauth2.googleapis.com/token'

//This file contains a hack to get a Google Auth Client that can do Domain Wide Delegation using a Service Account that has been given domain wide delegation rights
//While at the same time the initial authentication to Google is done using AWS IAM credentials and a Workload Identity Pool
//This apparently just works in python land, but not for nodejs
//Taken from https://github.com/googleapis/google-auth-library-nodejs/issues/916#issuecomment-2165926379

/**
 * This function generates an OAuth2 Access Token with scopes obtained via domain-wide delegation
 * without requiring a JSON key file from a Service Account.
 *
 * Resources:
 *  - https://github.com/googleapis/google-auth-library-nodejs/issues/916
 *  - https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys?hl=es-419#domain-wide-delegation
 *
 * @param impersonationEmail Email address of the Google account that has granted domain-wide scopes to the service account
 * @param serviceAccountEmail Service account which received the scopes using domain-wide delegation
 * @param googleApiScopes Scopes to request for the generated Access Token
 * @param lifetime Lifetime, in seconds, of the generated access token. It can't be greater than 1h
 * @returns the generated access token
 */
const getDomainWideDelegationAccessToken = async (
  impersonationEmail: string,
  serviceAccountEmail: string,
  googleApiScopes: string[],
  lifetime: number,
) => {
  const config = await getConfig()

  if (!impersonationEmail) {
    throw Error('impersonationEmail is required')
  }
  if (!serviceAccountEmail) {
    throw Error('serviceAccountEmail is required')
  }
  if (lifetime > 3600) {
    throw Error('lifetime cannot be greater than 3600 seconds (1 hour)')
  }

  // Build JWT token for domain-wide delegation
  const unsignedJwt = buildDomainWideDelegationJWT(
    serviceAccountEmail,
    impersonationEmail,
    googleApiScopes,
    lifetime,
  )

  // Sign JWT token using a system-managed private key of the given service account
  const signJwtResponse = await new IAMCredentialsClient().signJwt({
    name: `projects/-/serviceAccounts/${config.GOOGLE_SERVICE_ACCOUNT_EMAIL}`,
    payload: unsignedJwt,
  })

  if (!signJwtResponse || !signJwtResponse[0].signedJwt) {
    throw new Error('Failed to sign JWT token using the Service Account key')
  }

  return await generateDomainWideDelegationAccessToken(
    signJwtResponse[0].signedJwt,
  )
}

/**
 * Builds the payload to request a JWT token using domain-wide delegation.
 * See: https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys?hl=es-419#domain-wide-delegation
 */
function buildDomainWideDelegationJWT(
  serviceAccount: string,
  subject: string,
  scopes: string[],
  lifetime: number,
): string {
  const now = Math.floor(new Date().getTime() / 1000)

  const body: Record<string, string | number | undefined> = {
    iss: serviceAccount,
    aud: GOOGLE_OAUTH2_TOKEN_API_URL,
    iat: now,
    exp: now + lifetime,
    sub: subject ?? undefined,
    // Yes, this is a space delimited list.
    // Not a typo, the API expects the field to be "scope" (singular).
    scope: scopes && scopes.length > 0 ? scopes.join(' ') : undefined,
  }

  return JSON.stringify(body)
}

/**
 * We need to send this request using an alternative http client because we want to use a JWT (JSON Web Token) for Domain-Wide Delegation of Authority.
 * The Google Auth Library for Node.js does not provide a built-in method for this specific use case.
 * See: https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys?hl=es-419#domain-wide-delegation
 */
async function generateDomainWideDelegationAccessToken(
  signedJwt: string,
): Promise<string> {
  const url = GOOGLE_OAUTH2_TOKEN_API_URL
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  const body = new URLSearchParams()
  body.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer')
  body.append('assertion', signedJwt)

  try {
    const resp = await fetch(url, {
      method: 'POST',
      body: body.toString(),
      headers,
    })
    if (resp.status < 200 || resp.status > 299) {
      throw new Error(
        `Failed to call ${url}: HTTP ${resp.status}: ${await resp.text()}`,
      )
    }
    const data = (await resp.json()) as { access_token: string }
    return data.access_token
  } catch (err) {
    throw new Error(
      `Failed to generate Google Cloud Domain Wide Delegation OAuth 2.0 Access Token: ${err}`,
    )
  }
}

export const getAuthClientForScope = async (
  scopes: string[],
  user: string | undefined = undefined,
): Promise<OAuth2Client> => {
  const config = await getConfig()

  const accessToken = await getDomainWideDelegationAccessToken(
    user || config.GOOGLE_WORKSPACE_EMAIL, // The email of the user to impersonate
    config.GOOGLE_SERVICE_ACCOUNT_EMAIL, // The service account email
    scopes,
    15 * 60, // Lifetime of the access token, it cannot be greater than 1h
  )

  const oauth2Client = new OAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })
  return oauth2Client
}
