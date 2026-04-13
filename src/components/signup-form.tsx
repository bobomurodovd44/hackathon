"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { client } from "@/lib/feathers"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupFormInner({
  className,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "individual"
  
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [employeesCount, setEmployeesCount] = useState("10-50")
  const [age, setAge] = useState("")
  const [role, setRole] = useState(plan === "enterprise" ? "COMPANY_ADMIN" : "WORKER")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      await client.service("users").create({
        email,
        password,
        firstName,
        lastName,
        age: age ? parseInt(age, 10) : 0,
        role,
        ...(plan === "enterprise" && { companyName, employeesCount })
      })
      await client.authenticate({
        strategy: "local",
        email,
        password,
      })
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold font-mono tracking-tight">Создать аккаунт</h1>
          <p className="text-sm text-balance text-muted-foreground">
            {plan === "enterprise" ? "Регистрация компании для корпоративного тарифа" : "Заполните форму, чтобы зарегистрироваться"}
          </p>
        </div>
        {error && <div className="text-sm font-medium text-destructive text-center mb-2">{error}</div>}
        
        {plan === "enterprise" && (
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="companyName">Название компании</FieldLabel>
              <Input id="companyName" type="text" placeholder="ООО Инновации" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required minLength={2} />
            </Field>
            <Field>
              <FieldLabel htmlFor="employeesCount">Штат</FieldLabel>
               <select id="employeesCount" value={employeesCount} onChange={(e) => setEmployeesCount(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" required>
                 <option value="1-10">1-10 человек</option>
                 <option value="10-50">10-50 человек</option>
                 <option value="50-200">50-200 человек</option>
                 <option value="200+">200+ человек</option>
               </select>
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="firstName">Имя</FieldLabel>
            <Input id="firstName" type="text" placeholder="Азим" value={firstName} onChange={(e) => setFirstName(e.target.value)} required minLength={2} maxLength={50} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Фамилия</FieldLabel>
            <Input id="lastName" type="text" placeholder="Гулямов" value={lastName} onChange={(e) => setLastName(e.target.value)} required minLength={2} maxLength={50} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="age">Возраст</FieldLabel>
            <Input id="age" type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} required min={18} max={100} />
          </Field>
          <Field>
            <FieldLabel htmlFor="role">Роль</FieldLabel>
             <select id="role" value={role} onChange={(e) => setRole(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" required>
               <option value="ADMIN">Администратор</option>
               <option value="COMPANY_ADMIN">Руководитель</option>
               <option value="WORKER">Сотрудник</option>
             </select>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FieldDescription>
            Мы используем email для входа в систему.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Пароль</FieldLabel>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <FieldDescription>
            Минимум 6 символов.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Подтвердите пароль</FieldLabel>
          <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <FieldDescription>Введите пароль ещё раз.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={loading} className="bg-[#eb6e4b] hover:bg-[#d45e3c] text-white font-bold">
            {loading ? "Создаём..." : "Создать аккаунт"}
          </Button>
          <FieldDescription className="px-6 text-center">
            Уже есть аккаунт? <a href="/login">Войти</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}

export function SignupForm(props: Omit<React.ComponentProps<"form">, "onSubmit">) {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <SignupFormInner {...props} />
    </Suspense>
  )
}
