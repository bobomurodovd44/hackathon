import React from "react"
import { Building2, Users } from "lucide-react"
import { serverFetch } from "@/lib/server-api"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  let totals = { companies: 0, users: 0 }

  try {
    const [companiesResult, usersResult] = await Promise.all([
      serverFetch('/companies?$limit=0'),
      serverFetch('/users?$limit=0')
    ])

    totals.companies = companiesResult?.total || 0
    totals.users = usersResult?.total || 0
  } catch (error) {
    console.error("Error fetching dashboard totals:", error)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of the platform statistics.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Users className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">Total Users</div>
            <div className="text-xl font-bold">{totals.users.toLocaleString()}</div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm flex items-center gap-3 transition-all hover:shadow-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">Total Companies</div>
            <div className="text-xl font-bold">{totals.companies.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
