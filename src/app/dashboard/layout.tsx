import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login?callbackUrl=/dashboard")
  if (session.user.role === "admin") redirect("/admin")

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
