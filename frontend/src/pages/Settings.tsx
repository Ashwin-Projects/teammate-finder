import React, { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useStore } from "../store/useStore"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"

export const Settings: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    profile,
    fetchProfile,
    updateProfile,
    profileLoading,
    generateSummary,
    generateTeamSuggestion,
    saveSuggestion,
    fetchSavedSuggestions,
    savedSuggestions,
    aiLoading,
  } = useStore()

  // Tab management ("profile" or "ai")
  const queryParams = new URLSearchParams(location.search)
  const initialTab = queryParams.get("tab") === "ai" ? "ai" : "profile"
  const [activeTab, setActiveTab] = useState<"profile" | "ai">(initialTab)

  // Profile Form state
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState("")
  const [interests, setInterests] = useState("")
  const [competitions, setCompetitions] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("junior")
  const [availability, setAvailability] = useState("active")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // AI Suggestion Hub Form state
  const [compDesc, setCompDesc] = useState("")
  const [reqSkills, setReqSkills] = useState("")
  const [prefTech, setPrefTech] = useState("")
  const [teamSize, setTeamSize] = useState(4)
  const [generatedResult, setGeneratedResult] = useState<any | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
      .then((p) => {
        if (p) {
          setBio(p.bio || "")
          setSkills(p.skills?.join(", ") || "")
          setInterests(p.interests?.join(", ") || "")
          setCompetitions(p.competitions?.join(", ") || "")
          setExperienceLevel(p.experienceLevel || "junior")
          setAvailability(p.availability || "active")
        }
      })
      .catch(() => console.log("Profile not created yet."))
      
    fetchSavedSuggestions()
  }, [fetchProfile, fetchSavedSuggestions])

  // Sync tab with URL search parameter
  useEffect(() => {
    const tab = queryParams.get("tab") === "ai" ? "ai" : "profile"
    setActiveTab(tab)
  }, [location.search])

  const handleTabChange = (tab: "profile" | "ai") => {
    navigate(`/settings?tab=${tab}`)
  }

  // Profile submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(false)
    setSaveError(null)

    // Parse comma-separated inputs
    const parsedSkills = skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    const parsedInterests = interests
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0)
    const parsedCompetitions = competitions
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0)

    try {
      await updateProfile({
        bio,
        skills: parsedSkills,
        interests: parsedInterests,
        competitions: parsedCompetitions,
        experienceLevel,
        availability,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || "Failed to update profile details.")
    }
  }

  // Generate Bio Summary via AI
  const handleGenerateSummary = async () => {
    try {
      const summary = await generateSummary()
      alert(`AI bio summary updated:\n"${summary}"`)
    } catch (err: any) {
      alert(err.message || "Failed to generate AI summary.")
    }
  }

  // AI Suggestions submit
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!compDesc.trim()) return
    setAiError(null)
    setGeneratedResult(null)
    setAiSuccessMsg(null)

    const skillsArr = reqSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    const techArr = prefTech
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    try {
      const data = await generateTeamSuggestion({
        competitionDescription: compDesc,
        requiredSkills: skillsArr,
        teamSize,
        preferredTechnologies: techArr,
      })
      setGeneratedResult(data.suggestion)
    } catch (err: any) {
      setAiError(err.message || "OpenAI suggestor failed. Make sure your API key is configured.")
    }
  }

  // Save suggestion to DB
  const handleSaveSuggestion = async () => {
    if (!generatedResult || !compDesc.trim()) return
    try {
      await saveSuggestion({
        competitionDescription: compDesc,
        generatedResponse: generatedResult,
      })
      setAiSuccessMsg("Configuration saved to suggestion history!")
      fetchSavedSuggestions()
      setTimeout(() => setAiSuccessMsg(null), 3000)
    } catch (err) {
      alert("Failed to save configuration")
    }
  }

  return (
    <div className="w-full max-w-container-max mx-auto p-gutter md:p-xl space-y-xl">
      {/* Title Header */}
      <div className="border-b border-border pb-md">
        <h1 className="font-headline text-[32px] font-bold text-on-surface leading-tight">Settings</h1>
        <p className="text-body-base text-text-dim mt-xs">Update your developer details and configure crew suggestions</p>
      </div>

      {/* Tabs list */}
      <div className="flex gap-md border-b border-border/60 pb-[2px]">
        <button
          onClick={() => handleTabChange("profile")}
          className={`pb-md font-mono text-[11px] uppercase tracking-wider transition-colors border-b-2 px-sm ${
            activeTab === "profile"
              ? "text-primary border-primary font-bold"
              : "text-text-dim border-transparent hover:text-on-surface"
          }`}
        >
          Developer Profile
        </button>
        <button
          onClick={() => handleTabChange("ai")}
          className={`pb-md font-mono text-[11px] uppercase tracking-wider transition-colors border-b-2 px-sm ${
            activeTab === "ai"
              ? "text-primary border-primary font-bold"
              : "text-text-dim border-transparent hover:text-on-surface"
          }`}
        >
          AI Suggestion Hub
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "profile" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          {/* Main profile form */}
          <div className="lg:col-span-8">
            <Card hoverEffect={false}>
              <CardHeader>
                <CardTitle>Developer Information</CardTitle>
                <CardDescription>Setup details so matches are computed accurately</CardDescription>
              </CardHeader>

              <CardContent className="pt-md">
                {saveSuccess && (
                  <div className="mb-md p-sm bg-tertiary/10 border border-tertiary/20 rounded text-[12px] text-tertiary font-mono flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Profile updated successfully!</span>
                  </div>
                )}
                {saveError && (
                  <div className="mb-md p-sm bg-error/10 border border-error/20 rounded text-[12px] text-error font-mono flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{saveError}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="flex flex-col gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Bio Summary</label>
                    <textarea
                      placeholder="Describe your development focus (e.g. Distributed system design, high-performance backends...)"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full bg-surface-container-lowest border border-border rounded px-sm py-xs text-on-surface font-mono text-[12px] placeholder:text-text-dim focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Experience Level</label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="bg-surface-container-lowest border border-border rounded px-sm h-[32px] text-[12px] font-mono text-on-surface focus:outline-none focus:border-primary"
                      >
                        <option value="junior">Junior Developer</option>
                        <option value="intermediate">Intermediate Developer</option>
                        <option value="senior">Senior Developer</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-xs">
                      <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Match Pool Visibility</label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="bg-surface-container-lowest border border-border rounded px-sm h-[32px] text-[12px] font-mono text-on-surface focus:outline-none focus:border-primary"
                      >
                        <option value="active">Active (Visible in matchmaking)</option>
                        <option value="inactive">Inactive (Hide profile)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Technical Skills (Comma Separated)</label>
                    <Input
                      type="text"
                      placeholder="e.g. Rust, Go, React, Docker, Kubernetes"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                    <p className="text-[10px] text-text-dim font-mono">Used by the matching server to map similarity vectors.</p>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Interests (Comma Separated)</label>
                    <Input
                      type="text"
                      placeholder="e.g. Web3, GenAI, DevOps, Edge Computing"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Competition Targets (Comma Separated)</label>
                    <Input
                      type="text"
                      placeholder="e.g. EthGlobal, NextJS Hack, AI Summit"
                      value={competitions}
                      onChange={(e) => setCompetitions(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-sm mt-md">
                    <Button type="submit" variant="primary" isLoading={profileLoading} className="font-bold">
                      Save Changes
                    </Button>
                    {profile && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGenerateSummary}
                        disabled={profileLoading}
                        className="flex items-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-[16px]">psychology</span>
                        AI Auto-Summarize Bio
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card hoverEffect={false}>
              <CardHeader>
                <CardTitle>OpenAI Integration</CardTitle>
                <CardDescription>How matching summaries work</CardDescription>
              </CardHeader>
              <CardContent className="text-body-base text-text-muted space-y-md">
                <p>
                  Our server runs semantic profiling calculations. When you click **AI Auto-Summarize**, your skills and bio details are evaluated by an LLM model to generate a compressed 1-sentence descriptor.
                </p>
                <p className="border-t border-border pt-md font-mono text-[11px] text-text-dim">
                  Make sure your backend config includes your OpenAI credential keys to enable summary generation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
          {/* AI suggestion planner form */}
          <div className="lg:col-span-7 space-y-xl">
            <Card hoverEffect={false}>
              <CardHeader>
                <CardTitle>AI Teammate Suggestor</CardTitle>
                <CardDescription>Enter competition goals to calculate ideal team crew layouts</CardDescription>
              </CardHeader>

              <CardContent className="pt-md">
                <form onSubmit={handleAiSubmit} className="flex flex-col gap-md">
                  <div className="flex flex-col gap-xs">
                    <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Competition / Hackathon Description</label>
                    <textarea
                      placeholder="Describe the hackathon category and what you want to build (e.g. A decentralized identity locker with zero-knowledge credentials...)"
                      value={compDesc}
                      onChange={(e) => setCompDesc(e.target.value)}
                      rows={3}
                      required
                      disabled={aiLoading}
                      className="w-full bg-surface-container-lowest border border-border rounded px-sm py-xs text-on-surface font-mono text-[12px] placeholder:text-text-dim focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="flex flex-col gap-xs">
                      <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Target Team Size</label>
                      <Input
                        type="number"
                        min={2}
                        max={8}
                        value={teamSize}
                        onChange={(e) => setTeamSize(parseInt(e.target.value) || 4)}
                        disabled={aiLoading}
                      />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Preferred Tech</label>
                      <Input
                        type="text"
                        placeholder="React, Rust, PostgreSQL"
                        value={prefTech}
                        onChange={(e) => setPrefTech(e.target.value)}
                        disabled={aiLoading}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-xs">
                    <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Specific Required Skills</label>
                    <Input
                      type="text"
                      placeholder="Cryptography, CSS transitions, WebSockets"
                      value={reqSkills}
                      onChange={(e) => setReqSkills(e.target.value)}
                      disabled={aiLoading}
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full mt-sm font-bold" isLoading={aiLoading}>
                    Generate Crew Configuration
                  </Button>
                </form>

                {aiError && (
                  <div className="mt-md p-sm bg-error/10 border border-error/20 rounded text-[12px] text-error font-mono flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{aiError}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated results details card */}
            {generatedResult && (
              <Card hoverEffect={false} className="border-primary shadow-lg shadow-primary/5">
                <div className="flex items-center justify-between border-b border-border pb-md mb-lg">
                  <div>
                    <h3 className="font-headline text-title-md font-bold text-on-surface">Calculated Suggestion</h3>
                    <p className="text-[11px] text-text-dim font-mono">Crew Layout Generated by OpenAI</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSaveSuggestion} className="flex items-center gap-xs border border-primary/20 hover:border-primary/50 text-primary">
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Save Layout
                  </Button>
                </div>

                {aiSuccessMsg && (
                  <div className="mb-md p-sm bg-tertiary/10 border border-tertiary/20 rounded text-[11px] text-tertiary font-mono">
                    {aiSuccessMsg}
                  </div>
                )}

                <div className="space-y-lg text-body-base">
                  <div>
                    <h4 className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-xs">Recommended Roles & Sizes</h4>
                    <p className="text-on-surface font-semibold">Suggested team of {teamSize} developers</p>
                  </div>

                  {/* Render generated result text/JSON */}
                  <div className="bg-surface-container-low p-md rounded border border-border font-mono text-[12px] whitespace-pre-wrap text-on-surface max-h-[300px] overflow-y-auto">
                    {typeof generatedResult === "object"
                      ? JSON.stringify(generatedResult, null, 2)
                      : String(generatedResult)}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Historical Saved Suggestions list */}
          <div className="lg:col-span-5 flex flex-col gap-md">
            <Card hoverEffect={false}>
              <CardHeader>
                <CardTitle>History Configurations</CardTitle>
                <CardDescription>Saved AI crew suggestion configurations ({savedSuggestions.length})</CardDescription>
              </CardHeader>

              <CardContent className="max-h-[500px] overflow-y-auto no-scrollbar flex flex-col gap-md pt-sm">
                {savedSuggestions.length === 0 ? (
                  <div className="text-center py-xl text-text-dim text-[12px] border border-dashed border-border rounded">
                    No suggestions saved yet.
                  </div>
                ) : (
                  savedSuggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setGeneratedResult(item.generatedResponse)}
                      className="p-md bg-surface-container-low border border-border hover:border-primary/40 rounded transition-all cursor-pointer flex flex-col gap-sm"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-headline text-[13px] font-bold text-on-surface line-clamp-1 flex-1">
                          {item.competitionDescription}
                        </h4>
                        <span className="font-mono text-[9px] text-text-dim bg-background border border-border px-sm rounded shrink-0 ml-sm">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-dim line-clamp-2">
                        Click to load and view this crew configuration outline.
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
