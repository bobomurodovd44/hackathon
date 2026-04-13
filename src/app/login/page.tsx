import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium text-xl">
            <img src="/logo.svg" alt="Climb AI Logo" className="w-8 h-8 object-contain" />
            Climb AI
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/mega-creator.svg"
          alt="Illustration"
          className="absolute inset-0 h-full w-full object-contain p-12 dark:opacity-80"
        />
      </div>
    </div>
  )
}