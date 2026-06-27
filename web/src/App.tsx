 import { initApp } from '@freeappstore/sdk'
import { Shell } from '@freeappstore/sdk/ui'
import { useState, useEffect } from 'react'

const fas = initApp({ appId: 'my-todo-app' })

interface Todo {
  id: number
  text: string
  completed: boolean
  priority: 'High' | 'Medium' | 'Low'
  dueDate: string
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium')
  const [dueDate, setDueDate] = useState('')
  const [search, setSearch] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  function addTodo() {
    if (!input.trim()) return
    setTodos([...todos, {
      id: Date.now(),
      text: input.trim(),
      completed: false,
      priority,
      dueDate
    }])
    setInput('')
    setDueDate('')
    setPriority('Medium')
  }

  function toggleTodo(id: number) {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  function deleteTodo(id: number) {
    setTodos(todos.filter(t => t.id !== id))
  }

  function startEdit(todo: Todo) {
    setEditId(todo.id)
    setEditText(todo.text)
  }

  function saveEdit(id: number) {
    setTodos(todos.map(t => t.id === id ? { ...t, text: editText } : t))
    setEditId(null)
    setEditText('')
  }

  const filtered = todos.filter(t =>
    t.text.toLowerCase().includes(search.toLowerCase())
  )

  const completed = todos.filter(t => t.completed).length
  const total = todos.length

  const priorityColor = (p: string) => {
    if (p === 'High') return 'text-[var(--error)]'
    if (p === 'Medium') return 'text-[var(--warning)]'
    return 'text-[var(--success)]'
  }

  return (
    <Shell app={fas} appName="my-todo-app">
      <div className="flex flex-col items-center p-6 gap-4 w-full max-w-lg mx-auto">
        <h1 className="display-font text-3xl font-bold text-[var(--ink)]">My Todo App</h1>

        {total > 0 && (
          <div className="w-full p-4 rounded-[1.25rem] bg-[var(--panel)] border border-[var(--line)]">
            <div className="flex justify-between mb-2">
              <span className="text-[var(--muted)] text-sm">Progress</span>
              <span className="text-[var(--ink)] text-sm font-semibold">{completed}/{total} completed</span>
            </div>
            <div className="w-full bg-[var(--line)] rounded-full h-2">
              <div className="bg-[var(--accent)] h-2 rounded-full transition-all" style={{ width: `${(completed / total) * 100}%` }} />
            </div>
          </div>
        )}

        <input
          className="w-full p-3 rounded-[0.75rem] bg-[var(--panel)] text-[var(--ink)] border border-[var(--line)] outline-none"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="flex gap-2 w-full">
          <input
            className="flex-1 p-3 rounded-[0.75rem] bg-[var(--panel)] text-[var(--ink)] border border-[var(--line)] outline-none"
            placeholder="Add a new task..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
          />
          <button className="px-4 py-3 rounded-[0.75rem] bg-[var(--accent)] text-white font-semibold" onClick={addTodo}>
            Add
          </button>
        </div>

        <div className="flex gap-2 w-full">
          <select
            className="flex-1 p-3 rounded-[0.75rem] bg-[var(--panel)] text-[var(--ink)] border border-[var(--line)] outline-none"
            value={priority}
            onChange={e => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
          >
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>
          <input
            type="date"
            className="flex-1 p-3 rounded-[0.75rem] bg-[var(--panel)] text-[var(--ink)] border border-[var(--line)] outline-none"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>

        <ul className="w-full flex flex-col gap-2">
          {filtered.map(todo => (
            <li key={todo.id} className="flex flex-col gap-2 p-4 rounded-[1.25rem] bg-[var(--panel)] border border-[var(--line)]">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-5 h-5 cursor-pointer"
                />
                {editId === todo.id ? (
                  <input
                    className="flex-1 p-1 rounded bg-[var(--glass)] text-[var(--ink)] border border-[var(--line)] outline-none"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(todo.id)}
                  />
                ) : (
                  <span className={`flex-1 text-[var(--ink)] ${todo.completed ? 'line-through opacity-50' : ''}`}>
                    {todo.text}
                  </span>
                )}
                {editId === todo.id ? (
                  <button onClick={() => saveEdit(todo.id)} className="text-[var(--success)] font-bold">✓</button>
                ) : (
                  <button onClick={() => startEdit(todo)} className="text-[var(--muted)] font-bold">✏️</button>
                )}
                <button onClick={() => deleteTodo(todo.id)} className="text-[var(--error)] font-bold text-lg">✕</button>
              </div>
              <div className="flex gap-3 text-xs pl-8">
                <span className={`font-semibold ${priorityColor(todo.priority)}`}>{todo.priority} Priority</span>
                {todo.dueDate && (
                  <span className="text-[var(--muted)]">📅 Due: {todo.dueDate}</span>
                )}
              </div>
            </li>
          ))}
        </ul>

        {filtered.length === 0 && (
          <p className="text-[var(--muted)] mt-4">{search ? 'No tasks match your search.' : 'No tasks yet. Add one above!'}</p>
        )}

        <div className="text-center py-4">
          <a href="https://freeappstore.online" target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] text-xs hover:text-[var(--ink)]">Built for freeappstore.online</a>
        </div>
      </div>
    </Shell>
  )
}