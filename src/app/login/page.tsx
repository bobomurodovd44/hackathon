'use client'

import { useEffect } from "react"
import { LoginForm } from "@/components/login-form"

export default function Page() {
  useEffect(() => {
    const html = document.documentElement
    const hadDark = html.classList.contains("dark")
    html.classList.remove("dark")
    return () => {
      if (hadDark) html.classList.add("dark")
    }
  }, [])

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-[#faf8f6]">
      {/* Left: Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium text-xl">
            <img src="/logo.svg" alt="Climb AI Logo" className="w-8 h-8 object-contain" />
            <span className="font-mono font-black tracking-tighter text-gray-900">Climb AI</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </div>
      {/* Right: Image */}
      <div className="relative hidden bg-white lg:block border-l border-gray-100">
        <img
          src="/mega-creator.svg"
          alt="Illustration"
          className="absolute inset-0 h-full w-full object-contain p-12"
        />
      </div>
    </div>
  )
}