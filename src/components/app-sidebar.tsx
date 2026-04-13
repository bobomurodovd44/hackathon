'use client'

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Building2,
  Home,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react"

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
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Dashboard", url: "/admin", icon: ShieldCheck, roles: [UserRole.ADMIN], exact: true },
  { title: "Companies", url: "/admin/companies", icon: Building2, roles: [UserRole.ADMIN] },
  { title: "Company Portal", url: "/company", icon: Building2, roles: [UserRole.COMPANY_ADMIN], exact: true },
  { title: "Trainings", url: "/company/trainings", icon: Users, roles: [UserRole.COMPANY_ADMIN] },
  { title: "Trainings", url: "/user/trainings", icon: Users, roles: [UserRole.WORKER] },
  { title: "Employees", url: "/company/users", icon: UserPlus, roles: [UserRole.COMPANY_ADMIN] },
]

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  
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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src="/logo.svg" alt="Climb AI Logo" className="size-6 object-contain" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="text-lg font-bold">
                    {(user?.role === UserRole.COMPANY_ADMIN || user?.role === UserRole.WORKER) 
                      ? (user?.company?.name || "Climb AI") 
                      : "Climb AI"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {(user?.role === UserRole.COMPANY_ADMIN || user?.role === UserRole.WORKER) 
                      ? (user?.company?.industry || "Expert System") 
                      : "Expert System"}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-bold uppercase tracking-wider">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.url 
                  : pathname === item.url || pathname.startsWith(item.url + '/')
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.title} 
                      className={cn(
                        "h-10 transition-colors",
                        isActive ? "bg-sidebar-accent text-primary font-semibold" : ""
                      )}
                    >
                      <a href={item.url}>
                        <item.icon className={cn("size-5", isActive ? "text-primary" : "")} />
                        <span className="text-base">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-3 py-2 border rounded-lg bg-card">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-semibold">
                {initials}
              </div>
              <div className="flex flex-col gap-0.5 leading-none text-left overflow-hidden">
                <span className="font-bold truncate text-base">
                  {user ? `${user.firstName} ${user.lastName}` : "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => logout()}
              tooltip="Sign out"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-10"
            >
              <LogOut className="mr-2 size-5" />
              <span className="text-base">Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
