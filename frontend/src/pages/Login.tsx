import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useStore } from "../store/useStore"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await login(email, password)
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-gutter overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.1] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px]"
      >
        <Card hoverEffect={false} className="shadow-2xl">
          <CardHeader className="text-center mb-lg">
            <Link to="/" className="font-headline text-[22px] font-bold text-on-surface tracking-tight mb-xs inline-block">
              DevMatch AI
            </Link>
            <CardTitle className="text-headline-sm font-bold text-on-surface justify-center">Welcome back</CardTitle>
            <CardDescription className="text-body-base text-text-dim mt-xs">
              Sign in to your DevMatch AI account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-md p-sm bg-error/10 border border-error/20 rounded text-[12px] text-error font-mono flex items-center gap-xs">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Password</label>
                  <a href="#" className="font-mono text-[10px] text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" variant="primary" className="w-full mt-sm" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="relative my-xl">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-mono uppercase">
                <span className="bg-surface px-sm text-text-dim">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-sm">
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-sm font-mono text-[11px]"
                onClick={() => {
                  // Simulate login for ease of testing!
                  setEmail("alice@example.com")
                  setPassword("password123")
                }}
              >
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                Demo Alice
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-sm font-mono text-[11px]"
                onClick={() => {
                  // Simulate login for ease of testing!
                  setEmail("bob@example.com")
                  setPassword("password123")
                }}
              >
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                Demo Bob
              </Button>
            </div>

            <div className="mt-xl text-center">
              <p className="text-body-base text-text-dim">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
