"use client"
import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Anchor, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await signIn("credentials", { email, password, redirect: false, callbackUrl })
    setLoading(false)
    if (res?.error) {
      setError("Invalid email or password")
    } else {
      router.push(res?.url || callbackUrl)
      router.refresh()
    }
  }

  const demoLogin = async (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword("demo1234")
    setLoading(true)
    const res = await signIn("credentials", { email: demoEmail, password: "demo1234", redirect: false, callbackUrl })
    setLoading(false)
    if (res?.error) setError("Demo login failed")
    else { router.push(res?.url || callbackUrl); router.refresh() }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-6">
            <Anchor className="h-7 w-7 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">WaveRide</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome back</h1>
          <p className="text-gray-600 mb-6">Sign in to manage your bookings, boats, or agency operations.</p>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm font-semibold text-gray-900 mb-3">Quick demo access:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Button variant="outline" size="sm" onClick={() => demoLogin("admin@boatrent.com")} disabled={loading}>
                Admin
              </Button>
              <Button variant="outline" size="sm" onClick={() => demoLogin("owner@boatrent.com")} disabled={loading}>
                Boat Owner
              </Button>
              <Button variant="outline" size="sm" onClick={() => demoLogin("agency@boatrent.com")} disabled={loading}>
                Travel Agency
              </Button>
              <Button variant="outline" size="sm" onClick={() => demoLogin("customer@boatrent.com")} disabled={loading}>
                Customer
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">All demo accounts use password: <code className="bg-gray-100 px-1 rounded">demo1234</code></p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">Create one</Link>
            </div>
            <div className="md:hidden mt-4">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Quick demo:</p>
              <Tabs defaultValue="admin">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                  <TabsTrigger value="owner">Owner</TabsTrigger>
                  <TabsTrigger value="agency">Agency</TabsTrigger>
                  <TabsTrigger value="cust">Cust.</TabsTrigger>
                </TabsList>
                <TabsContent value="admin"><Button size="sm" className="w-full mt-2" variant="outline" onClick={() => demoLogin("admin@boatrent.com")} disabled={loading}>Login as Admin</Button></TabsContent>
                <TabsContent value="owner"><Button size="sm" className="w-full mt-2" variant="outline" onClick={() => demoLogin("owner@boatrent.com")} disabled={loading}>Login as Owner</Button></TabsContent>
                <TabsContent value="agency"><Button size="sm" className="w-full mt-2" variant="outline" onClick={() => demoLogin("agency@boatrent.com")} disabled={loading}>Login as Agency</Button></TabsContent>
                <TabsContent value="cust"><Button size="sm" className="w-full mt-2" variant="outline" onClick={() => demoLogin("customer@boatrent.com")} disabled={loading}>Login as Customer</Button></TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
