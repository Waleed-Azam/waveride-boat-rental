"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Anchor, LayoutDashboard, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const dashboardPath = session?.user?.role === "admin"
    ? "/admin"
    : session?.user?.role === "owner"
    ? "/dashboard/owner"
    : session?.user?.role === "agency"
    ? "/dashboard/agency"
    : "/dashboard"

  const go = (href: string) => {
    setMenuOpen(false)
    router.push(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Anchor className="h-6 w-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">WaveRide</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/boats"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname?.startsWith("/boats") ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Boats
            </Link>
            <Link
              href="/how-it-works"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === "/how-it-works" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              How it Works
            </Link>
            <Link
              href="/destinations"
              className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                pathname === "/destinations" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              Destinations
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <Link href={dashboardPath}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-gray-100"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {session.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline">{session.user.name}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{session.user.role}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => go(dashboardPath)}>Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => go("/dashboard/bookings")}>My Bookings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onSelect={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link href="/register"><Button size="sm" className="bg-blue-600 hover:bg-blue-700">Get Started</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white p-4 space-y-2">
          <Link href="/boats" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Boats</Link>
          <Link href="/how-it-works" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>How it Works</Link>
          <Link href="/destinations" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Destinations</Link>
          <hr className="my-2" />
          {session ? (
            <>
              <Link href={dashboardPath} className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link href="/dashboard/bookings" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>My Bookings</Link>
              <button
                onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }) }}
                className="block w-full text-left py-2 text-sm font-medium text-red-600"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link href="/register" className="block py-2 text-sm font-medium text-blue-600" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
