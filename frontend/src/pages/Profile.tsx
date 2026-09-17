import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "../store/useStore"
import { Button } from "../components/ui/button"
import { Card } from "../components/ui/card"

export const Profile: React.FC = () => {
  const navigate = useNavigate()
  const { user, profile, fetchProfile, profileLoading, generateSummary } = useStore()

  useEffect(() => {
    fetchProfile().catch(() => {
      console.log("Failed to fetch profile. User probably hasn't created one yet.")
    })
  }, [fetchProfile])

  const handleGenerateSummary = async () => {
    try {
      const summary = await generateSummary()
      alert(`AI Summary Generated:\n"${summary}"`)
    } catch (err: any) {
      alert(err.message || "Failed to generate AI summary. Make sure OpenAI key is set up in backend.")
    }
  }

  if (profileLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-[100px] gap-sm">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-[12px] text-text-dim">Retrieving developer profile...</p>
      </div>
    )
  }

  // Handle empty profile state
  if (!profile && user) {
    return (
      <div className="max-w-[500px] mx-auto px-gutter py-[80px] text-center flex flex-col gap-lg items-center">
        <div className="w-16 h-16 rounded-full bg-surface-container border border-border flex items-center justify-center text-text-muted">
          <span className="material-symbols-outlined text-[36px]">person_off</span>
        </div>
        <div>
          <h1 className="font-headline text-[24px] font-bold text-on-surface">No profile setup yet</h1>
          <p className="text-body-base text-text-dim mt-sm leading-relaxed">
            Welcome to DevMatch AI, {user.name}! To connect with other hackathon developers, you need to create your skills profile first.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => navigate("/settings")}>
          Create My Profile
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-container-max mx-auto p-gutter md:p-xl space-y-xl">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-lg gap-md">
        <div>
          <h1 className="font-headline text-[32px] font-bold text-on-surface leading-tight">
            {user?.name}
          </h1>
          <p className="text-body-base text-text-dim mt-xs capitalize">
            {profile.experienceLevel} Developer | {profile.availability} for Hackathons
          </p>
        </div>
        <div className="flex gap-sm">
          <Button
            variant="outline"
            className="flex items-center gap-xs"
            onClick={() => navigate("/settings")}
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Edit Profile
          </Button>
          <Button
            variant="primary"
            className="flex items-center gap-xs font-bold"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
              alert("Profile link copied to clipboard!")
            }}
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            Share
          </Button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-xl">
        {/* Left Column: Main Profile Information */}
        <div className="md:col-span-8 space-y-xl">
          {/* Bio Card */}
          <Card hoverEffect={true} className="p-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex flex-col sm:flex-row gap-lg items-start relative z-10">
              <div className="w-20 h-20 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-headline font-bold text-[24px] uppercase shrink-0">
                {user?.name.substring(0, 2)}
              </div>
              <div className="flex-1">
                <h3 className="font-headline text-title-md font-bold text-on-surface mb-sm">About Me</h3>
                <p className="text-body-base text-text-muted leading-relaxed">
                  {profile.bio || "Write a detailed bio in Settings to let teams know about your skills and interests!"}
                </p>
                <div className="mt-lg flex flex-wrap gap-xs">
                  <span className="font-mono text-[10px] px-sm py-[2px] bg-surface-container border border-border rounded text-on-surface">
                    Level: <span className="capitalize">{profile.experienceLevel}</span>
                  </span>
                  <span className="font-mono text-[10px] px-sm py-[2px] bg-surface-container border border-border rounded text-on-surface flex items-center gap-xs">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    Available: <span className="capitalize">{profile.availability}</span>
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Generated summary card */}
          <Card hoverEffect={true} className="p-lg bg-surface-container-low/50">
            <div className="flex justify-between items-start mb-md">
              <h3 className="font-headline text-title-md font-bold text-on-surface flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px] text-primary">psychology</span>
                AI Profile Summary
              </h3>
              <Button variant="outline" size="sm" onClick={handleGenerateSummary}>
                Regenerate
              </Button>
            </div>
            <p className="text-body-base text-text-muted leading-relaxed italic">
              {profile.summary ? `"${profile.summary}"` : "Click 'Regenerate' to let the AI build a concise matching report based on your skills and hackathon history."}
            </p>
          </Card>

          {/* Technical Stack */}
          <Card hoverEffect={true} className="p-lg">
            <h3 className="font-headline text-title-md font-bold text-on-surface mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-[20px] text-text-dim">code</span>
              Technical Stack
            </h3>
            <div className="space-y-md">
              <div>
                <h4 className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-xs">Languages & Frameworks</h4>
                <div className="flex flex-wrap gap-sm">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill: string) => (
                      <span key={skill} className="font-mono text-[11px] h-[22px] px-sm bg-surface-hover border border-border rounded text-on-surface flex items-center">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[12px] text-text-dim italic">No skills listed yet</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-xs">Areas of Interest</h4>
                <div className="flex flex-wrap gap-sm">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map((interest: string) => (
                      <span key={interest} className="font-mono text-[11px] h-[22px] px-sm bg-surface-hover border border-border rounded text-text-muted flex items-center">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-[12px] text-text-dim italic">No interests listed yet</span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Hackathon History */}
          <Card hoverEffect={true} className="p-lg">
            <h3 className="font-headline text-title-md font-bold text-on-surface mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-[20px] text-text-dim">emoji_events</span>
              Hackathon History
            </h3>
            <div className="space-y-md">
              {profile.competitions && profile.competitions.length > 0 ? (
                profile.competitions.map((comp: string, i: number) => (
                  <div key={comp} className="group border border-border rounded p-md hover:bg-surface-hover transition-colors relative">
                    <div className="flex justify-between items-start mb-xs">
                      <h4 className="font-headline text-[14px] font-bold text-on-surface group-hover:text-primary transition-colors">
                        {comp}
                      </h4>
                      <span className="font-mono text-[10px] text-tertiary bg-tertiary/10 border border-tertiary/20 px-xs py-[2px] rounded">
                        {i === 0 ? "Podium Finish" : "Participant"}
                      </span>
                    </div>
                    <p className="text-body-base text-text-dim">Matched and collaborated with developers globally.</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-md border border-dashed border-border rounded text-text-dim text-[12px] italic">
                  No hackathons listed yet.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Badges and Teams */}
        <div className="md:col-span-4 space-y-xl">
          {/* Verified Wins Badge */}
          <Card hoverEffect={true} className="p-lg flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-md">
              <span className="material-symbols-outlined text-[32px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
            <h3 className="font-headline text-title-md font-bold text-on-surface">Verified Profile</h3>
            <p className="text-body-base text-text-dim mt-xs">
              This developer profile is verified and active on the DevMatch matching engine.
            </p>
          </Card>

          {/* Availability Widget */}
          <Card hoverEffect={true} className="p-lg">
            <h3 className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-md">Matchmaking Status</h3>
            <div className="flex items-center gap-md border border-border rounded p-sm bg-surface-container-low">
              <div className="w-10 h-10 rounded bg-tertiary/10 border border-tertiary/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
              </div>
              <div>
                <h4 className="font-headline text-[13px] font-bold text-on-surface leading-tight">Match Pool Active</h4>
                <p className="text-[11px] text-text-dim mt-[2px]">Currently visible to matching algorithm suggestion feeds.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
