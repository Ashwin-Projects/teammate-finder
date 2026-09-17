import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { useStore } from "../store/useStore"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"

export const Signup: React.FC = () => {
  const navigate = useNavigate()
  const { signup } = useStore()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await signup(name, email, password)
      // Redirect to settings to let them initialize their profile!
      navigate("/settings")
    } catch (err: any) {
      setError(err.message || "Failed to create account. Check if email is already in use.")
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
            <CardTitle className="text-headline-sm font-bold text-on-surface justify-center">Create your account</CardTitle>
            <CardDescription className="text-body-base text-text-dim mt-xs">
              Start finding hackathon teammates globally
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
                <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Full Name</label>
                <Input
                  type="text"
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

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
                <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Password</label>
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
                Create Account
              </Button>
            </form>

            <div className="mt-xl text-center">
              <p className="text-body-base text-text-dim">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
