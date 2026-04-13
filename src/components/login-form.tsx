'use client'

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { AuthGuard } from "./auth-guard"
import { AlertCircle } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await login({ email, password })
    } catch (err: any) {
      setError(err.message || "Invalid email or password")
      setIsSubmitting(false)
    }
  }

  return (
    <AuthGuard variant="public">
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-gray-900 mb-1">Login to your account</h1>
          <p className="text-sm text-muted-foreground">Enter your email below to login to your account</p>
        </div>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="size-4" />
                <p>{error}</p>
              </div>
            )}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                disabled={isSubmitting}
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isSubmitting}
              />
            </Field>
            <Field className="pt-2">
              <Button
                type="submit"
                className="w-full bg-[#eb6e4b] hover:bg-[#d45e3c] text-white font-bold h-11"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </AuthGuard>
  )
}
