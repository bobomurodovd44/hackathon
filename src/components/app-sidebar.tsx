'use client'

import {
  Building2,
  ChevronUp,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  UserPlus,
  Users,
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
import { useAuth, UserRole } from "@/lib/auth-context"

const navItems = [
  { title: "Dashboard", url: "/admin", icon: ShieldCheck, roles: [UserRole.ADMIN] },
  { title: "Companies", url: "/admin/companies", icon: Building2, roles: [UserRole.ADMIN] },
  { title: "Trainings", url: "/admin/trainings", icon: Users, roles: [UserRole.ADMIN] },
  { title: "Company Portal", url: "/company", icon: Building2, roles: [UserRole.COMPANY_ADMIN] },
  { title: "Trainings", url: "/company/trainings", icon: Users, roles: [UserRole.COMPANY_ADMIN] },
  { title: "Employees", url: "/company/users", icon: UserPlus, roles: [UserRole.COMPANY_ADMIN] },
  { title: "My Profile", url: "/user", icon: User, roles: [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.WORKER] },
  { title: "Settings", url: "/settings", icon: Settings, roles: [UserRole.ADMIN, UserRole.COMPANY_ADMIN, UserRole.WORKER] },
]

export function AppSidebar() {
  const { user, logout } = useAuth()
  
  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role as UserRole))
  )

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : "U"

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboard className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Hackathon</span>
                  <span className="text-xs text-muted-foreground">Portal</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
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
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                    {initials}
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none text-left">
                    <span className="font-semibold truncate">
                      {user ? `${user.firstName} ${user.lastName}` : "User"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {user?.email || "user@example.com"}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/user">
                    <User className="mr-2 size-4" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
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
