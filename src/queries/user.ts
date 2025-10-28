import { userRepo } from "@/server/firestore"
import { useAppSession } from "@/server/session"
import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"

const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(async () => {
  const session = await useAppSession()
  const userId = session.data.userId

  if (!userId) {
    return null
  }

  return await userRepo.getById(userId)
})

export const userQueryOptions = queryOptions({
  queryKey: ['currentUser'] as const,
  queryFn: getCurrentUserFn,
})
