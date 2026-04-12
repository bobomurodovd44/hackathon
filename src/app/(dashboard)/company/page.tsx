export default function CompanyPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Company Dashboard</h1>
      <p className="text-muted-foreground">Manage your organization's resources and settings.</p>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Staff Members</div>
          <div className="text-2xl font-bold">156</div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Open Projects</div>
          <div className="text-2xl font-bold">8</div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="text-sm font-medium text-muted-foreground">Vector Store Usage</div>
          <div className="text-2xl font-bold">75%</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm min-h-[300px]">
          <h2 className="text-lg font-semibold mb-4">Company Overview</h2>
          <p className="text-sm text-muted-foreground">Detailed metrics for your company...</p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm min-h-[300px]">
          <h2 className="text-lg font-semibold mb-4">Latest Invoices</h2>
          <p className="text-sm text-muted-foreground">Nothing to show yet.</p>
        </div>
      </div>
    </div>
  )
}
