'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  ChevronUp,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Settings,
  User,
  Users,
  BarChart3,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useTranslation } from '@/i18n/provider'
import { client } from '@/lib/feathers'

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<any>
}

function getNavItems(role: string, t: ReturnType<typeof useTranslation>['t']): NavItem[] {
  switch (role) {
    case 'ADMIN':
      return [
        { title: t.dashboard.common.home, url: '/dashboard/admin', icon: Home },
        { title: t.dashboard.sidebar.admin.companies, url: '/dashboard/admin/companies', icon: Building2 },
        { title: t.dashboard.sidebar.admin.allUsers, url: '/dashboard/admin/users', icon: Users },
        { title: t.dashboard.common.settings, url: '/dashboard/settings', icon: Settings },
      ]
    case 'COMPANY_ADMIN':
      return [
        { title: t.dashboard.common.home, url: '/dashboard/manager', icon: Home },
        { title: t.dashboard.sidebar.manager.trainings, url: '/dashboard/manager/trainings', icon: GraduationCap },
        { title: t.dashboard.sidebar.manager.employees, url: '/dashboard/manager/employees', icon: Users },
        { title: t.dashboard.sidebar.manager.uploads, url: '/dashboard/manager/upload', icon: FileText },
        { title: t.dashboard.sidebar.manager.analytics, url: '/dashboard/manager/analytics', icon: BarChart3 },
        { title: t.dashboard.common.settings, url: '/dashboard/settings', icon: Settings },
      ]
    case 'WORKER':
      return [
        { title: t.dashboard.common.home, url: '/dashboard/employee', icon: Home },
        { title: t.dashboard.sidebar.worker.myTrainings, url: '/dashboard/employee/trainings', icon: GraduationCap },
        { title: t.dashboard.common.settings, url: '/dashboard/settings', icon: Settings },
      ]
    default:
      return [
        { title: t.dashboard.common.home, url: '/dashboard', icon: Home },
      ]
  }
}

function getRoleName(role: string, t: ReturnType<typeof useTranslation>['t']): string {
  switch (role) {
    case 'ADMIN': return t.dashboard.roles.ADMIN
    case 'COMPANY_ADMIN': return t.dashboard.roles.COMPANY_ADMIN
    case 'WORKER': return t.dashboard.roles.WORKER
    default: return role
  }
}

function getRoleColor(role: string): string {
  switch (role) {
    case 'ADMIN': return 'bg-red-500'
    case 'COMPANY_ADMIN': return 'bg-[#eb6e4b]'
    case 'WORKER': return 'bg-emerald-500'
    default: return 'bg-gray-500'
  }
}

export function DashboardSidebar({ user }: { user: any }) {
  const router = useRouter()
  const { t } = useTranslation()
  const navItems = getNavItems(user.role, t)

  const handleLogout = async () => {
    await client.logout()
    router.push('/')
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="mb-6 mt-2">
              <Link href="/dashboard">
                <img src="/logo.svg" alt="Climb AI" className="size-10 object-contain" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-mono font-bold text-2xl">Climb AI</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-bold text-gray-400 mb-2">{t.dashboard.common.navigation}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton size="lg" asChild tooltip={item.title} className="text-base py-6 font-medium">
                    <Link href={item.url}>
                      <item.icon className="scale-125 mr-1" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${getRoleColor(user.role)} text-white text-sm font-bold`}>
                    {user.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="font-semibold">{user.firstName} {user.lastName}</span>
                    <span className="text-xs text-muted-foreground">{getRoleName(user.role, t)}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuLabel>{t.dashboard.common.account}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 size-4" />
                    {t.dashboard.common.profile}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 size-4" />
                  {t.dashboard.common.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
