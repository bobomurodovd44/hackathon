import React from "react"
import { Users, BookOpen } from "lucide-react"
import { serverFetch } from "@/lib/server-api"

export const dynamic = 'force-dynamic'

export default async function CompanyPage() {
  let totals = { users: 0, trainings: 0 }

  try {
    const [usersResult, trainingsResult] = await Promise.all([
      serverFetch('/users?$limit=0'),
      serverFetch('/trainings?$limit=0')
    ])

    totals.users = usersResult?.total || 0
    totals.trainings = trainingsResult?.total || 0
  } catch (error) {
    console.error("Error fetching company dashboard totals:", error)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Company Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your organization's resources.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Users className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">Staff Members</div>
            <div className="text-xl font-bold">{totals.users.toLocaleString()}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <BookOpen className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">Total Trainings</div>
            <div className="text-xl font-bold">{totals.trainings.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center gap-4 bg-muted/20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border shadow-sm text-muted-foreground">
            <Users className="size-8" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Your Workforce</h2>
            <p className="text-sm text-muted-foreground max-w-[280px]">Manage your employees, assign trainings, and track progress from here.</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center gap-4 bg-primary/5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background border shadow-sm text-primary">
            <BookOpen className="size-8" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Active Curriculum</h2>
            <p className="text-sm text-muted-foreground max-w-[280px]">Access and manage the expert-led training tracks built for your team.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
