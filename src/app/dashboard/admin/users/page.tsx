'use client'

import { useCallback, useEffect, useState } from 'react'
import { UserPlus, Users, Loader2 } from 'lucide-react'
import { client } from '@/lib/feathers'

type Company = { _id: string; name: string }
type Manager = {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'COMPANY_ADMIN'
  companyId?: string
}
type PaginatedResult<T> = { data: T[] }

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message
  return fallback
}

export default function AdminUsersPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    age: 30,
    email: '',
    password: '',
    companyId: ''
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [companiesRes, managersRes] = await Promise.all([
        client.service('companies').find({ query: { $limit: 100 } }) as Promise<PaginatedResult<Company>>,
        client.service('users').find({ query: { role: 'COMPANY_ADMIN', $limit: 100 } }) as Promise<PaginatedResult<Manager>>
      ])
      setCompanies(companiesRes.data || [])
      setManagers(managersRes.data || [])

      if (companiesRes.data?.length) {
        setForm((prev) => ({ ...prev, companyId: prev.companyId || companiesRes.data[0]._id }))
      }
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Не удалось загрузить данные'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const createManager = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyId) {
      setError('Сначала создайте компанию')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await client.service('users').create({
        firstName: form.firstName,
        lastName: form.lastName,
        age: Number(form.age),
        email: form.email,
        password: form.password,
        role: 'COMPANY_ADMIN',
        companyId: form.companyId
      })

      setForm((prev) => ({ ...prev, firstName: '', lastName: '', email: '', password: '' }))
      await loadData()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Не удалось создать аккаунт руководителя'))
    } finally {
      setSubmitting(false)
    }
  }

  const companyNameById = (id?: string) => companies.find((company) => company._id === id)?.name || '—'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-mono font-extrabold text-gray-900 dark:text-white">Руководители компаний</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Создавайте аккаунты менеджеров и назначайте их к компаниям.</p>
      </div>

      <form onSubmit={createManager} className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#eb6e4b]" />
          <h2 className="font-mono font-bold text-xl">Новый руководитель</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Имя" value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} required minLength={2} />
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Фамилия" value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} required minLength={2} />
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Пароль" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required minLength={6} />
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Возраст" type="number" min={18} max={100} value={form.age} onChange={(e) => setForm((prev) => ({ ...prev, age: Number(e.target.value) }))} required />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.companyId} onChange={(e) => setForm((prev) => ({ ...prev, companyId: e.target.value }))} required>
            <option value="">Выберите компанию</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>{company.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#eb6e4b] hover:bg-[#d45e3c] text-white font-bold disabled:opacity-60">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Создать аккаунт руководителя
        </button>
      </form>

      <div className="space-y-3">
        {error && <div className="text-sm text-red-500">{error}</div>}
        {loading ? (
          <div className="text-gray-500">Загрузка...</div>
        ) : managers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-gray-500">Руководителей пока нет</div>
        ) : (
          managers.map((manager) => (
            <div key={manager._id} className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 mt-0.5 text-[#eb6e4b]" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{manager.firstName} {manager.lastName}</div>
                  <div className="text-sm text-gray-500">{manager.email}</div>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{companyNameById(manager.companyId)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
