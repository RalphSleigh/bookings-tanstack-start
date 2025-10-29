import { userRepo } from '@/server/firestore'
import { useAppSession } from '@/server/session'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { getCookies, getRequestHeaders } from '@tanstack/react-start/server'

const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(async () => {


    const request = getRequestHeaders()
    request.forEach((value, key) => {
        console.log(`HEADER: ${key} = ${value}`)
    })

  const cookie = getCookies()

  console.log('CURRENT COOKIES:', JSON.stringify(cookie))


  const session = await useAppSession()

  console.log('CURRENT SESSION:', session)
  console.log('CURRENT SESSION DATA:', session.data)


  const userId = session.data.userId

  console.log('CURRENT USER ID:', userId)

  if (!userId) {
    return null
  }

  const user = await userRepo.getById(userId)
  console.log('CURRENT USER:', user)

  return user
})

export const userQueryOptions = queryOptions({
  queryKey: ['currentUser'] as const,
  queryFn: getCurrentUserFn,
})
