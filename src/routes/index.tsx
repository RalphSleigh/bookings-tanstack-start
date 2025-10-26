import { Firestore } from '@google-cloud/firestore'
import { createFileRoute, useRouteContext } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

const firestore = new Firestore({
  databaseId: 'todos',
})

const getTodos = createServerFn({ method: 'GET' }).handler(async () => {

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

const getTodoQueryOptions = {
  queryKey: ['todos'] as const,
  queryFn: async () => {
    return getTodos()
  },
}


export const Route = createFileRoute('/')({ 
  
  loader: async ({context}) => {
    return context.queryClient.ensureQueryData(getTodoQueryOptions)
  },
  component: App })

function App() {
  const context = useRouteContext({from: '/'})
  const todos = useSuspenseQuery(getTodoQueryOptions)
  const [todo, setTodo] = useState('')
  const submitTodo = useCallback(async () => {
      await createTodo({data: { name: todo }})
      setTodo('')
      context.queryClient.invalidateQueries({ queryKey:['todos']})
    }, [todo])
  return (
    <>
      <div>Welcome to the TanStack Start App!</div>
      <ul>
        {todos.data.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
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
    </>
  )
}
