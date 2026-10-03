"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Anchor, LayoutDashboard, Ship, Calendar as CalIcon, BookOpen, Users,
  Settings, LogOut, RefreshCw, BarChart3, Building2, AlertTriangle,
} from "lucide-react"

type NavItem = {
  label: string
  href: string
  icon: any
}

export function DashboardSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role

  const ownerNav: NavItem[] = [
    { label: "Overview", href: "/dashboard/owner", icon: LayoutDashboard },
    { label: "My Boats", href: "/dashboard/owner/boats", icon: Ship },
    { label: "Calendar", href: "/dashboard/owner/calendar", icon: CalIcon },
    { label: "Bookings", href: "/dashboard/owner/bookings", icon: BookOpen },
    { label: "Sync Center", href: "/dashboard/owner/sync", icon: RefreshCw },
  ]
  const agencyNav: NavItem[] = [
    { label: "Overview", href: "/dashboard/agency", icon: LayoutDashboard },
    { label: "Browse Boats", href: "/boats", icon: Ship },
    { label: "My Bookings", href: "/dashboard/agency/bookings", icon: BookOpen },
    { label: "Clients", href: "/dashboard/agency/clients", icon: Users },
  ]
  const customerNav: NavItem[] = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Bookings", href: "/dashboard/bookings", icon: BookOpen },
    { label: "Browse Boats", href: "/boats", icon: Ship },
  ]
  const adminNav: NavItem[] = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Boats", href: "/admin/boats", icon: Ship },
    { label: "Bookings", href: "/admin/bookings", icon: BookOpen },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Sync Monitor", href: "/admin/sync", icon: RefreshCw },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ]

  const nav =
    role === "admin" ? adminNav :
    role === "owner" ? ownerNav :
    role === "agency" ? agencyNav :
    customerNav

  const baseHref =
    role === "admin" ? "/admin" :
    role === "owner" ? "/dashboard/owner" :
    role === "agency" ? "/dashboard/agency" :
    "/dashboard"

  return (
    <aside className="w-64 bg-white border-r flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Anchor className="h-6 w-6 text-blue-600" />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            WaveRide
          </span>
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-semibold">
            {session?.user.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{session?.user.name}</div>
            <div className="text-xs text-gray-500 capitalize">{role}{session?.user.companyName ? ` · ${session.user.companyName}` : ""}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== baseHref && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t space-y-2">
        <Link href="/">
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Building2 className="h-4 w-4 mr-2" /> Public Site
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </div>
    </aside>
  )
}
