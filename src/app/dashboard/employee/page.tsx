'use client'

import { useEffect, useState } from 'react'
import { GraduationCap, Clock } from 'lucide-react'
import { useTranslation } from '@/i18n/provider'
import { client } from '@/lib/feathers'

export default function EmployeeDashboard() {
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
            query: { companyId: res.user.companyId, status: 'active', $limit: 50 }
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
          {t.dashboard.employee.hello}{user ? `, ${user.firstName}` : ''} 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t.dashboard.employee.subtitle}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-mono font-bold text-gray-900 dark:text-white mb-4">{t.dashboard.employee.myTrainings}</h2>
        {loading ? (
          <div className="text-gray-500">{t.dashboard.common.loading}</div>
        ) : trainings.length === 0 ? (
          <div className="bg-white dark:bg-[#111] border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-semibold">{t.dashboard.employee.noTrainingsTitle}</p>
            <p className="text-gray-400 text-sm mt-1">{t.dashboard.employee.noTrainingsDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainings.map((training: any) => (
              <div key={training._id} className="group bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer">
                {training.image_url && (
                  <img src={training.image_url} alt={training.title} className="w-full h-32 object-cover rounded-xl mb-4" />
                )}
                <h3 className="font-mono font-bold text-lg text-gray-900 dark:text-white group-hover:text-[#eb6e4b] transition-colors">
                  {training.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{training.description}</p>
                <div className="flex items-center gap-2 mt-4">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600">{t.dashboard.employee.notCompleted}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
