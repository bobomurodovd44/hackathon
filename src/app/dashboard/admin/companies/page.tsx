'use client'

import { useEffect, useState } from 'react'
import { Building2, Plus, Loader2 } from 'lucide-react'
import { client } from '@/lib/feathers'

type Company = {
  _id: string
  name: string
  industry: string
  status: 'active' | 'inactive' | 'suspended'
  maxWorkers: number
}

type PaginatedResult<T> = { data: T[] }

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message
  return fallback
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    industry: '',
    status: 'active' as Company['status'],
    maxWorkers: 50
  })

  const loadCompanies = async () => {
    setLoading(true)
    try {
      const res = await client.service('companies').find({ query: { $limit: 100 } }) as PaginatedResult<Company>
      setCompanies(res.data || [])
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Не удалось загрузить компании'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const createCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await client.service('companies').create({
        name: form.name,
        industry: form.industry,
        status: form.status,
        maxWorkers: Number(form.maxWorkers)
      })
      setForm({ name: '', industry: '', status: 'active', maxWorkers: 50 })
      await loadCompanies()
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Не удалось создать компанию'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-mono font-extrabold text-gray-900 dark:text-white">Компании</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Создавайте и управляйте workspace-клиентами.</p>
      </div>

      <form onSubmit={createCompany} className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#eb6e4b]" />
          <h2 className="font-mono font-bold text-xl">Новая компания</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Название компании" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required minLength={2} />
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Сфера (например: retail)" value={form.industry} onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))} required minLength={2} />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Company['status'] }))}>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="suspended">suspended</option>
          </select>
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" type="number" min={1} value={form.maxWorkers} onChange={(e) => setForm((prev) => ({ ...prev, maxWorkers: Number(e.target.value) }))} required />
        </div>

        <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#eb6e4b] hover:bg-[#d45e3c] text-white font-bold disabled:opacity-60">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Создать компанию
        </button>
      </form>

      <div className="space-y-3">
        {error && <div className="text-sm text-red-500">{error}</div>}
        {loading ? (
          <div className="text-gray-500">Загрузка...</div>
        ) : companies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center text-gray-500">Компаний пока нет</div>
        ) : (
          companies.map((company) => (
            <div key={company._id} className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 mt-0.5 text-[#eb6e4b]" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{company.name}</div>
                  <div className="text-sm text-gray-500">{company.industry} · до {company.maxWorkers} сотрудников</div>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">{company.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
