export default function UserPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Personal Profile</h1>
      <p className="text-muted-foreground">View and manage your account details.</p>
      
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
            AU
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">Admin User</h2>
            <p className="text-sm text-muted-foreground">admin@hackathon.com</p>
            <div className="mt-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
              Administrator
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Secure your account with 2FA</p>
              </div>
              <div className="text-sm font-semibold text-primary">Enabled</div>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Notification Preferences</p>
                <p className="text-sm text-muted-foreground">Manage email alerts</p>
              </div>
              <button className="text-sm font-semibold text-primary">Configure</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
