"use client"
import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Anchor } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get("role") || "customer"
  const [role, setRole] = useState(initialRole)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Registration failed")
        setLoading(false)
        return
      }
      toast.success("Account created! Signing you in...")
      const signRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: role === "customer" ? "/dashboard" : `/dashboard/${role}`,
      })
      if (signRes?.url) {
        router.push(signRes.url)
        router.refresh()
      }
    } catch (err) {
      toast.error("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-2xl mb-6">
          <Anchor className="h-7 w-7 text-blue-600" />
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">WaveRide</span>
        </Link>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Join WaveRide as a customer, boat owner, or travel agency</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={setRole} className="mb-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="owner">Boat Owner</TabsTrigger>
                <TabsTrigger value="agency">Agency</TabsTrigger>
              </TabsList>
            </Tabs>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {role === "customer" ? "Full Name" : role === "owner" ? "Your Name" : "Contact Person"}
                </Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={role === "agency" ? "Jane Smith" : "Your full name"}
                />
              </div>
              {role !== "customer" && (
                <div className="space-y-2">
                  <Label htmlFor="companyName">{role === "owner" ? "Company / Charter Name" : "Agency Name"}</Label>
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    placeholder={role === "owner" ? "Aegean Yachting Co." : "Greek Islands Travel SA"}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+30 ..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-600">
              Already have an account? <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
