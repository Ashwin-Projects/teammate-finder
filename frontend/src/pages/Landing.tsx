import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Button } from "../components/ui/button"

export const Landing: React.FC = () => {
  const navigate = useNavigate()
  const [demoInput, setDemoInput] = useState("")
  const [demoMatches, setDemoMatches] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleDemoSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!demoInput.trim()) return

    setIsSearching(true)
    setTimeout(() => {
      setDemoMatches([
        {
          name: "Sarah Jenkins",
          role: "Frontend & UI Engineer",
          matchScore: 98,
          skills: ["React", "Tailwind CSS", "Framer Motion", "Figma"],
          bio: "Specializing in crafting premium visual layouts and fluid web interactions.",
          avatar: "SJ"
        },
        {
          name: "David Chen",
          role: "Machine Learning Dev",
          matchScore: 92,
          skills: ["Python", "PyTorch", "FastAPI", "Docker"],
          bio: "Building data pipelines and fine-tuning lightweight models for web apps.",
          avatar: "DC"
        }
      ])
      setIsSearching(false)
    }, 1500)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  } as const

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  } as const

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col selection:bg-zinc-100 selection:text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 w-full py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-headline text-[18px] font-bold tracking-tight">
              DevMatch{" "}
              <span className="text-zinc-300 font-mono font-semibold text-[11px] bg-zinc-900 border border-zinc-800 px-2 py-[2px] rounded ml-2">
                AI
              </span>
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-zinc-300 hover:text-white hover:bg-zinc-900/60 transition-colors"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                variant="primary"
                className="bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800 font-medium transition-colors shadow-none"
              >
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Top Section: Header & Hero */}
        <section className="max-w-7xl mx-auto px-6 w-full pt-16 pb-12">
          <motion.div
            className="flex flex-col gap-6 max-w-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-zinc-900 text-zinc-400 border border-zinc-800 text-xs px-2.5 py-1 rounded-full w-fit font-mono uppercase tracking-wider"
            >
              <span className="w-2 h-2 rounded-full bg-zinc-500" />
              <span>Active Global Matchmaking</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-headline text-[40px] md:text-[56px] leading-[1.05] font-bold tracking-tight text-white"
            >
              Find the perfect teammate for your next <span className="text-white">hackathon</span>.
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-[15px] md:text-[18px] text-zinc-400 max-w-[560px] leading-relaxed"
            >
              Stop searching blindly. Our cosine-similarity AI analyzes your coding stack, experience level, and interests to recommend developers who complement your skillset.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/signup")}
                className="bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800 font-medium transition-colors shadow-none"
              >
                Build Your Profile
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900/50 transition-colors"
                onClick={() => {
                  const element = document.getElementById("demo-interactive")
                  element?.scrollIntoView({ behavior: "smooth" })
                }}
              >
                Try the Demo
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 pt-4">
              <span className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full">
                <span className="text-white font-semibold">98%</span> Match Accuracy
              </span>
              <span className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full">
                <span className="text-white font-semibold">&lt; 1 min</span> Match Discovery
              </span>
              <span className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full">
                <span className="text-white font-semibold">1,200+</span> Successful Teams
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* Middle Section: AI Card */}
        <section className="max-w-7xl mx-auto px-6 w-full py-12">
          <motion.div
            className="w-full flex justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              id="demo-interactive"
              className="w-full max-w-2xl bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-6 md:p-8"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-zinc-200">psychology</span>
                  <span className="font-mono text-[11px] uppercase tracking-wide text-zinc-100 font-semibold">
                    AI Teammate Suggestor
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Demo Sandbox</span>
              </div>

              <form onSubmit={handleDemoSearch} className="flex flex-col gap-3">
                <label className="font-mono text-[10px] text-zinc-500 uppercase">
                  Competition / Idea Description
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder="e.g. Build a Web3 micro-payment system with React and Go"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded py-3 px-4 text-zinc-100 font-mono text-[11px] leading-none placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSearching}
                    className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium transition-colors shadow-none"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">Press Enter to match with mock developers.</p>
              </form>

              {/* Results Animation Area */}
              <div className="mt-8 min-h-[160px] flex flex-col gap-4 relative">
                {demoMatches.length === 0 && !isSearching && (
                  <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-800 rounded">
                    <span className="material-symbols-outlined text-[24px] text-zinc-500">chat_bubble</span>
                    <p className="text-[12px] text-zinc-400 mt-3">
                      Enter a search query to simulate matchmaking suggestions.
                    </p>
                  </div>
                )}

                {isSearching && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-transparent animate-spin" />
                    <p className="text-[11px] font-mono text-zinc-500">Running cosine-similarity match calculations...</p>
                  </div>
                )}

                {demoMatches.length > 0 && !isSearching && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                    <p className="font-mono text-[10px] uppercase text-zinc-300">
                      Matching Developers found ({demoMatches.length})
                    </p>
                    {demoMatches.map((dev, i) => (
                      <motion.div
                        key={dev.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded p-4 flex items-start gap-4 transition-colors"
                      >
                        <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center text-[11px] font-mono font-bold text-zinc-100 border border-zinc-800 shrink-0">
                          {dev.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[12px] font-bold text-white truncate">{dev.name}</h4>
                            <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 rounded">
                              {dev.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-zinc-400">{dev.role}</p>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-normal">{dev.bio}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {dev.skills.map((skill: string) => (
                              <span
                                key={skill}
                                className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-200 px-2 py-[2px] rounded"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bottom Section: Features */}
        <section className="border-t border-zinc-900">
          <div className="max-w-7xl mx-auto px-6 w-full py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-3">
              <span className="material-symbols-outlined text-[24px] text-zinc-400">diversity_3</span>
              <h3 className="text-title-md font-bold text-white">Complementary Skills</h3>
              <p className="text-body-base text-zinc-400 leading-relaxed">
                We look at your profile weaknesses and pair you with developers who possess strengths in those exact areas.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="material-symbols-outlined text-[24px] text-zinc-400">bolt</span>
              <h3 className="text-title-md font-bold text-white">Real-Time Team Building</h3>
              <p className="text-body-base text-zinc-400 leading-relaxed">
                Direct message matched developers, join unified team groups, and start building immediately.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="material-symbols-outlined text-[24px] text-zinc-400">auto_awesome</span>
              <h3 className="text-title-md font-bold text-white">AI Match Reports</h3>
              <p className="text-body-base text-zinc-400 leading-relaxed">
                Describe your specific competition details and let OpenAI formulate the ideal developer crew breakdown.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 w-full py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="font-headline text-[13px] font-bold text-white">DevMatch AI</span>
          <p className="font-mono text-[10px] text-zinc-500">© 2026 DevMatch AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
