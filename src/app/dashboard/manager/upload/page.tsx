'use client'

import { useState } from 'react'
import Cookies from 'js-cookie'
import { Loader2, UploadCloud, Sparkles } from 'lucide-react'
import { client } from '@/lib/feathers'
import { uploadFile } from '@/lib/upload'

type UploadResult = { _id: string; url: string }
type Training = { _id: string; title: string }
type Lesson = { _id: string }
type AiChatResponse = { response: string }

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) return error.message
  return fallback
}

export default function ManagerUploadPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [spec, setSpec] = useState<'finance' | 'sales-department' | 'human-resources'>('sales-department')
  const [prompt, setPrompt] = useState('Сгенерируй подробный обучающий материал и практические задания по этому документу.')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ trainingId: string; lessonId: string; preview: string } | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setResult(null)

    if (!file) {
      setError('Загрузите файл перед генерацией.')
      return
    }

    setLoading(true)

    try {
      const token = Cookies.get('feathers-jwt')
      if (!token) throw new Error('Сессия истекла. Войдите заново.')

      const auth = await client.reAuthenticate()
      const user = auth.user as { companyId?: string }
      if (!user.companyId) throw new Error('У пользователя не найден companyId.')

      const uploaded = await uploadFile(file, token, setProgress) as UploadResult
      if (!uploaded._id) throw new Error('Не удалось получить id загруженного файла.')

      const training = await client.service('trainings').create({
        title,
        description,
        image: uploaded._id,
        companyId: user.companyId,
        spec,
        status: 'draft'
      }) as Training

      const lesson = await client.service('lessons').create({
        trainingId: training._id,
        title: `${title} — Урок 1`,
        description: 'Автогенерация через AI',
        type: 'teach',
        status: 'draft'
      }) as Lesson

      const ai = await client.service('ai-chat').create({
        type: 'markdown_gen',
        lessonId: lesson._id,
        prompt
      }) as AiChatResponse

      await client.service('lesson-contents').create({
        lessonId: lesson._id,
        markdown: ai.response
      })

      setResult({
        trainingId: training._id,
        lessonId: lesson._id,
        preview: ai.response.slice(0, 600)
      })
      setProgress('Готово')
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Не удалось создать тренинг и сгенерировать контент'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl md:text-4xl font-mono font-extrabold text-gray-900 dark:text-white">AI Генерация тренинга</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Загрузите документ, создайте тренинг и автоматически получите lesson content через OpenAI.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111] border border-orange-100 dark:border-orange-950 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="h-10 rounded-md border border-input bg-background px-3 text-sm" placeholder="Название тренинга" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={spec} onChange={(e) => setSpec(e.target.value as 'finance' | 'sales-department' | 'human-resources')}>
            <option value="sales-department">Sales department</option>
            <option value="finance">Finance</option>
            <option value="human-resources">Human resources</option>
          </select>
        </div>

        <textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Описание тренинга" value={description} onChange={(e) => setDescription(e.target.value)} required />

        <textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Промпт для AI" value={prompt} onChange={(e) => setPrompt(e.target.value)} required />

        <label className="flex items-center gap-3 border border-dashed rounded-xl p-4 cursor-pointer">
          <UploadCloud className="w-5 h-5 text-[#eb6e4b]" />
          <span className="text-sm text-gray-600 dark:text-gray-300">{file ? file.name : 'Выберите PDF/TXT файл'}</span>
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>

        {progress && <p className="text-sm text-gray-500">{progress}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#eb6e4b] hover:bg-[#d45e3c] text-white font-bold disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Создать и сгенерировать
        </button>
      </form>

      {result && (
        <div className="bg-white dark:bg-[#111] border border-emerald-200 dark:border-emerald-900 rounded-2xl p-6 space-y-3">
          <h2 className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-300">Готово</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">Training ID: {result.trainingId}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Lesson ID: {result.lessonId}</p>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-black/40 rounded-lg p-4 max-h-96 overflow-auto">{result.preview}</pre>
        </div>
      )}
    </div>
  )
}
