import { userRepo } from '@/server/firestore'
import { useAppSession } from '@/server/session'
import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { getCookies, getRequestHeaders } from '@tanstack/react-start/server'

const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession()

  const userId = session.data.userId

  if (!userId) {
    return null
  }

  const user = await userRepo.getById(userId)

  return user
})

export const userQueryOptions = queryOptions({
  queryKey: ['currentUser'] as const,
  queryFn: getCurrentUserFn,
})
