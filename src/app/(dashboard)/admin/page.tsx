export default function AdminPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the administration portal.</p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Total Users</div>
          <div className="text-2xl font-bold">1,234</div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Active Companies</div>
          <div className="text-2xl font-bold">42</div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">System Health</div>
          <div className="text-2xl font-bold text-green-500">99.9%</div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Pending Tasks</div>
          <div className="text-2xl font-bold">12</div>
        </div>
      </div>
      
      <div className="rounded-xl border bg-card p-6 shadow-sm min-h-[400px]">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground italic">Activity feed will be displayed here...</p>
        </div>
      </div>
    </div>
  )
}
