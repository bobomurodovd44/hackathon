'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, Users, FileText, BarChart3, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/provider'
import { client } from '@/lib/feathers'

export default function ManagerDashboard() {
  const { t } = useTranslation()
  const [user, setUser] = useState<any>(null)
  const [trainings, setTrainings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.reAuthenticate().then(async (res) => {
      setUser(res.user)
      if (res.user?.companyId) {
        try {
          const result = await client.service('trainings').find({
            query: { companyId: res.user.companyId, $limit: 50 }
          })
          setTrainings(result.data || [])
        } catch (e) {}
      }
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-mono font-extrabold text-gray-900 dark:text-white">
          {t.dashboard.manager.welcome}{user ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.dashboard.manager.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-4 h-4 text-[#eb6e4b]" />
            <span className="text-xs font-bold text-gray-500">{t.dashboard.manager.trainings}</span>
          </div>
          <span className="text-2xl font-mono font-black text-gray-900 dark:text-white">
            {loading ? '...' : trainings.length}
          </span>
        </div>
        <div className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#eb6e4b]" />
            <span className="text-xs font-bold text-gray-500">{t.dashboard.manager.employees}</span>
          </div>
          <span className="text-2xl font-mono font-black text-gray-900 dark:text-white">—</span>
        </div>
        <div className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-[#eb6e4b]" />
            <span className="text-xs font-bold text-gray-500">{t.dashboard.manager.documents}</span>
          </div>
          <span className="text-2xl font-mono font-black text-gray-900 dark:text-white">—</span>
        </div>
        <div className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#eb6e4b]" />
            <span className="text-xs font-bold text-gray-500">{t.dashboard.manager.avgScore}</span>
          </div>
          <span className="text-2xl font-mono font-black text-gray-900 dark:text-white">—</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/dashboard/manager/upload" className="group bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-6 hover:shadow-lg transition-all">
          <FileText className="w-8 h-8 text-[#eb6e4b] mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-mono font-bold text-lg text-gray-900 dark:text-white">{t.dashboard.manager.uploadDocument}</h3>
          <p className="text-sm text-gray-500 mt-1">{t.dashboard.manager.uploadDocumentDesc}</p>
        </a>
        <a href="/dashboard/manager/employees" className="group bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-6 hover:shadow-lg transition-all">
          <Users className="w-8 h-8 text-[#eb6e4b] mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-mono font-bold text-lg text-gray-900 dark:text-white">{t.dashboard.manager.addEmployee}</h3>
          <p className="text-sm text-gray-500 mt-1">{t.dashboard.manager.addEmployeeDesc}</p>
        </a>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-mono font-bold text-gray-900 dark:text-white">{t.dashboard.manager.trainings}</h2>
          <Button asChild className="bg-[#eb6e4b] hover:bg-[#d45e3c] text-white rounded-xl font-bold">
            <a href="/dashboard/manager/upload">
              <Plus className="w-4 h-4 mr-2" />
              {t.dashboard.manager.createTraining}
            </a>
          </Button>
        </div>
        {loading ? (
          <div className="text-gray-500">{t.dashboard.common.loading}</div>
        ) : trainings.length === 0 ? (
          <div className="bg-white dark:bg-[#111] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">{t.dashboard.manager.noTrainingsTitle}</p>
            <p className="text-gray-400 text-sm mt-1">{t.dashboard.manager.noTrainingsDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trainings.map((training: any) => (
              <div key={training._id} className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{training.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{training.description?.slice(0, 80)}...</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${training.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {training.status === 'active' ? t.dashboard.manager.statusActive : t.dashboard.manager.statusDraft}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
