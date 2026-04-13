"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { client } from "@/lib/feathers"

export default function HiddenAdminSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    age: 30, // Требуется схемой на бекенде
    role: "ADMIN", // Форсируем создание админа (по схеме ADMIN, COMPANY_ADMIN, WORKER)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // 1. Создаем пользователя
      await client.service("users").create(formData)
      
      // 2. Сразу логинимся
      await client.authenticate({
        strategy: "local",
        email: formData.email,
        password: formData.password,
      })

      // 3. Редирект на дашборд
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Ошибка при создании админа")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold font-mono text-[#eb6e4b] mb-2">Создание Супер-Админа</h1>
        <p className="text-sm text-gray-400 mb-6">Эта страница нигде не светится. Используйте её только для создания главных руководителей системы.</p>

        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-6 border border-red-500/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-1">Имя</label>
            <Input 
              required
              className="bg-black border-gray-700 text-white" 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-1">Фамилия</label>
            <Input 
              required
              className="bg-black border-gray-700 text-white"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-1">Email</label>
            <Input 
              type="email"
              required
              className="bg-black border-gray-700 text-white"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-300 block mb-1">Пароль</label>
            <Input 
              type="password"
              required
              className="bg-black border-gray-700 text-white"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-[#eb6e4b] hover:bg-[#d45e3c] font-bold mt-4"
          >
            {loading ? "Создаем..." : "Зарегистрировать Супер-Админа"}
          </Button>
        </form>
      </div>
    </div>
  )
}
