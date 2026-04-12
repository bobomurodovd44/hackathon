import { AuthGuard } from '@/components/auth-guard'

export default function Home() {
  return (
    <AuthGuard variant="public">
      <h1>Home</h1>
    </AuthGuard>
  )
}
