'use client'

import { useEffect, useState } from 'react'
import { UserPlus, Users, Loader2 } from 'lucide-react'
import { client } from '@/lib/feathers'

type Worker = {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'WORKER'
}

type PaginatedResult<T> = { data: T[] }

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message
  return fallback
}

export default function ManagerEmployeesPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    age: 25,
    jobTitle: '',
    email: '',
    password: ''
  })

  const loadWorkers = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await client.service('users').find({ query: { role: 'WORKER', $limit: 200 } }) as PaginatedResult<Worker>
      setWorkers(res.data || [])
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Не удалось загрузить сотрудников'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkers()
  }, [])

  const createWorker = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await client.service('users').create({
        firstName: form.firstName,
        lastName: form.lastName,
        age: Number(form.age),
        jobTitle: form.jobTitle || undefined,
        email: form.email,
        password: form.password,
        role: 'WORKER'
      })

      setForm({ firstName: '', lastName: '', age: 25, jobTitle: '', email: '', password: '' })
      await loadWorkers()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Не удалось создать сотрудника'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-mono font-extrabold text-gray-900 dark:text-white">Сотрудники</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Создавайте аккаунты сотрудников вашей компании.</p>
      </div>

      <form onSubmit={createWorker} className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#eb6e4b]" />
          <h2 className="font-mono font-bold text-xl">Новый сотрудник</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Имя" value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} required minLength={2} />
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Фамилия" value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} required minLength={2} />
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Должность" value={form.jobTitle} onChange={(e) => setForm((prev) => ({ ...prev, jobTitle: e.target.value }))} />
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" type="number" min={18} max={100} placeholder="Возраст" value={form.age} onChange={(e) => setForm((prev) => ({ ...prev, age: Number(e.target.value) }))} required />
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Пароль" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required minLength={6} />
        </div>

        <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#eb6e4b] hover:bg-[#d45e3c] text-white font-bold disabled:opacity-60">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Создать аккаунт сотрудника
        </button>
      </form>

      <div className="space-y-3">
        {error && <div className="text-sm text-red-500">{error}</div>}
        {loading ? (
          <div className="text-gray-500">Загрузка...</div>
        ) : workers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-gray-500">Сотрудников пока нет</div>
        ) : (
          workers.map((worker) => (
            <div key={worker._id} className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 mt-0.5 text-[#eb6e4b]" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{worker.firstName} {worker.lastName}</div>
                  <div className="text-sm text-gray-500">{worker.email}</div>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">WORKER</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
