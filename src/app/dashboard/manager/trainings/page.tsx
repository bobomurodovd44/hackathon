'use client'

import { useEffect, useState } from 'react'
import { client } from '@/lib/feathers'

type Training = {
  _id: string
  title: string
  description: string
  status?: 'active' | 'draft'
}

export default function ManagerTrainingsPage() {
  const [items, setItems] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.reAuthenticate()
      .then(async (auth) => {
        const user = auth.user as { companyId?: string }
        if (!user.companyId) return
        const res = await client.service('trainings').find({ query: { companyId: user.companyId, $limit: 100 } }) as { data: Training[] }
        setItems(res.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-mono font-extrabold">Тренинги компании</h1>
      {loading ? (
        <p className="text-gray-500">Загрузка...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Пока нет тренингов.</p>
      ) : (
        <div className="space-y-3">
          {items.map((training) => (
            <div key={training._id} className="rounded-xl border p-4 bg-white dark:bg-[#111]">
              <p className="font-bold">{training.title}</p>
              <p className="text-sm text-gray-500">{training.description}</p>
              <p className="text-xs mt-1 text-gray-400">{training.status || 'draft'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
