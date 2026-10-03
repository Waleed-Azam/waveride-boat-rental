import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      companyName?: string | null
    } & DefaultSession["user"]
  }
  interface User {
    role: string
    companyName?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    companyName?: string | null
  }
}
