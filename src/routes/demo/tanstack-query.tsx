import { useCallback, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Firestore } from '@google-cloud/firestore'

const firestore = new Firestore({
  databaseId: 'bookings',
})

const getTodos = createServerFn({ method: 'GET' }).handler(async ({data}) => {

  const snapshot = await firestore.collection('todos').get()
  const todos: { id: number; name: string }[] = []
  snapshot.forEach((doc) => {
    const data = doc.data()
    todos.push({ id: doc.id as unknown as number, name: data.name })
  })
  return todos
})

const createTodo = createServerFn({ method: 'POST' }).inputValidator((data: { name: string }) => data).handler(async ({data}) => {
  const { name } = data
  const docRef = firestore.collection('todos').doc()
  await docRef.set({ name })
  return { id: docRef.id, name }
})

export const Route = createFileRoute('/demo/tanstack-query')({
  component: TanStackQueryDemo,
  loader: async () => {
    return { todos: await getTodos() }
  },
})

type Todo = {
  id: number
  name: string
}

function TanStackQueryDemo() {
  const data = Route.useLoaderData().todos

  const [todo, setTodo] = useState('')

  const submitTodo = useCallback(async () => {
    await createTodo({data: { name: todo }})
    setTodo('')
  }, [todo])

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black p-4 text-white"
      style={{
        backgroundImage:
          'radial-gradient(50% 50% at 80% 20%, #3B021F 0%, #7B1028 60%, #1A000A 100%)',
      }}
    >
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <h1 className="text-2xl mb-4">TanStack Query Todos list</h1>
        <ul className="mb-4 space-y-2">
          {data?.map((t) => (
            <li
              key={t.id}
              className="bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md"
            >
              <span className="text-lg text-white">{t.name}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submitTodo()
              }
            }}
            placeholder="Enter a new todo..."
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            disabled={todo.trim().length === 0}
            onClick={submitTodo}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Add todo
          </button>
        </div>
      </div>
    </div>
  )
}
