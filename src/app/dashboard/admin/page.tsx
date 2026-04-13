'use client'

import { useEffect, useState } from 'react'
import { Building2, Users, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/provider'
import { client } from '@/lib/feathers'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.service('companies').find({ query: { $limit: 50 } })
      .then((res: any) => setCompanies(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-mono font-extrabold text-gray-900 dark:text-white">
          {t.dashboard.admin.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.dashboard.admin.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-[#eb6e4b]" />
            <span className="text-sm font-bold text-gray-500">{t.dashboard.admin.companies}</span>
          </div>
          <span className="text-3xl font-mono font-black text-gray-900 dark:text-white">
            {loading ? '...' : companies.length}
          </span>
        </div>
        <div className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-[#eb6e4b]" />
            <span className="text-sm font-bold text-gray-500">{t.dashboard.admin.users}</span>
          </div>
          <span className="text-3xl font-mono font-black text-gray-900 dark:text-white">—</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-mono font-bold text-gray-900 dark:text-white">{t.dashboard.admin.companies}</h2>
          <Button className="bg-[#eb6e4b] hover:bg-[#d45e3c] text-white rounded-xl font-bold">
            <Plus className="w-4 h-4 mr-2" />
            {t.dashboard.admin.newCompany}
          </Button>
        </div>
        {loading ? (
          <div className="text-gray-500">{t.dashboard.common.loading}</div>
        ) : companies.length === 0 ? (
          <div className="bg-white dark:bg-[#111] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">{t.dashboard.admin.noCompaniesTitle}</p>
            <p className="text-gray-400 text-sm mt-1">{t.dashboard.admin.noCompaniesDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {companies.map((company: any) => (
              <div key={company._id} className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{company.name}</h3>
                  <p className="text-sm text-gray-500">{company.industry} · {t.dashboard.admin.maxWorkers.replace('{count}', String(company.maxWorkers))}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${company.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {company.status === 'active' ? t.dashboard.admin.statusActive : company.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
