import React, { useEffect, useState } from "react"
import { useStore } from "../store/useStore"
import { Button } from "../components/ui/button"
import { Dialog } from "../components/ui/dialog"
import { Input } from "../components/ui/input"

export const Dashboard: React.FC = () => {
  const {
    matches,
    matchesLoading,
    fetchMatches,
    teams,
    fetchTeams,
    createTeam,
    addTeamMember,
    profile,
    fetchProfile,
  } = useStore()

  const [selectedMatch, setSelectedMatch] = useState<any | null>(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false)
  
  // Create team form state
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDesc, setNewTeamDesc] = useState("")
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Filters state
  const [skillFilter, setSkillFilter] = useState("")
  const [expFilter, setExpFilter] = useState("all")
  const [availFilter, setAvailFilter] = useState("all")

  useEffect(() => {
    fetchProfile().catch(() => {
      // Gracefully handle if profile is not created yet (redirect to settings)
      console.log("No profile found. Redirection would be helpful.")
    })
    fetchMatches()
    fetchTeams()
  }, [fetchMatches, fetchTeams, fetchProfile])

  // Set default selected match when matches list updates
  useEffect(() => {
    if (matches.length > 0 && !selectedMatch) {
      setSelectedMatch(matches[0])
    }
  }, [matches, selectedMatch])

  const handleSelectMatch = (match: any) => {
    setSelectedMatch(match)
  }

  const handleInviteToTeam = async (teamId: string) => {
    if (!selectedMatch) return
    setActionLoading(true)
    setActionError(null)
    try {
      await addTeamMember(teamId, selectedMatch.userId)
      setInviteModalOpen(false)
      alert(`Successfully invited ${selectedMatch.name} to the team!`)
    } catch (err: any) {
      setActionError(err.message || "Failed to invite teammate. Are they already in the team?")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return
    setActionLoading(true)
    setActionError(null)
    try {
      const created = await createTeam(newTeamName, newTeamDesc, [selectedMatch.userId])
      setCreateTeamModalOpen(false)
      setNewTeamName("")
      setNewTeamDesc("")
      alert(`Team ${created.name} created and ${selectedMatch.name} added!`)
    } catch (err: any) {
      setActionError(err.message || "Failed to create team.")
    } finally {
      setActionLoading(false)
    }
  }

  // Filter logic
  const filteredMatches = matches.filter((m) => {
    // Skill filter
    if (skillFilter.trim() && !m.skills.some((s: string) => s.toLowerCase().includes(skillFilter.toLowerCase()))) {
      return false
    }
    // Experience level filter
    if (expFilter !== "all" && m.experienceLevel?.toLowerCase() !== expFilter.toLowerCase()) {
      return false
    }
    // Availability filter
    if (availFilter !== "all" && m.availability?.toLowerCase() !== availFilter.toLowerCase()) {
      return false
    }
    return true
  })

  // If user doesn't have a profile yet, let's guide them
  const hasNoProfile = !profile

  return (
    <div className="flex h-full min-h-0 divide-x divide-border">
      {/* Center Pane: Matches List */}
      <section className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto p-gutter md:p-xl gap-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md border-b border-border pb-lg">
          <div>
            <h1 className="font-headline text-headline-sm md:text-[28px] font-bold text-on-surface">Teammate Finder</h1>
            <p className="text-body-base text-text-dim mt-xs">Cosine-similarity recommended developers matching your profile</p>
          </div>
          <div className="flex flex-wrap gap-sm">
            <input
              type="text"
              placeholder="Filter by skill..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="bg-surface border border-border rounded px-sm h-[32px] text-body-base text-on-surface focus:outline-none focus:border-primary placeholder:text-text-dim w-[140px]"
            />
            <select
              value={expFilter}
              onChange={(e) => setExpFilter(e.target.value)}
              className="bg-surface border border-border rounded px-sm h-[32px] text-[12px] font-mono text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Exp</option>
              <option value="junior">Junior</option>
              <option value="intermediate">Intermediate</option>
              <option value="senior">Senior</option>
            </select>
            <select
              value={availFilter}
              onChange={(e) => setAvailFilter(e.target.value)}
              className="bg-surface border border-border rounded px-sm h-[32px] text-[12px] font-mono text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">All Availability</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {hasNoProfile && (
          <div className="bg-primary/5 border border-primary/20 p-lg rounded flex flex-col md:flex-row items-center justify-between gap-md">
            <div>
              <h3 className="font-bold text-primary flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">info</span>
                Create Your Profile First
              </h3>
              <p className="text-body-base text-text-muted mt-xs">
                You need a profile containing skills, interests, and availability so the AI matching engine can compute recommendations.
              </p>
            </div>
            <Button variant="primary" onClick={() => window.location.href = "/settings"}>
              Setup Profile
            </Button>
          </div>
        )}

        {matchesLoading ? (
          <div className="flex flex-col items-center justify-center py-[100px] gap-sm">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-[12px] text-text-dim">Matching developer profiles...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[100px] border border-dashed border-border rounded">
            <span className="material-symbols-outlined text-[36px] text-text-dim mb-sm animate-bounce">search_off</span>
            <h3 className="text-title-md font-bold text-on-surface">No developers found</h3>
            <p className="text-body-base text-text-dim mt-xs text-center max-w-[340px]">
              Try adjusting your filters or update your own skills list in Settings so the engine finds matches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {filteredMatches.map((match) => {
              const isSelected = selectedMatch?.userId === match.userId
              return (
                <div
                  key={match.userId}
                  onClick={() => handleSelectMatch(match)}
                  className={`border rounded p-lg flex flex-col gap-sm cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                    isSelected
                      ? "bg-surface-hover border-primary shadow-lg shadow-primary/5"
                      : "bg-surface border-border hover:border-border-hover"
                  }`}
                >
                  <div className="flex items-start justify-between gap-md">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded bg-surface-container-high border border-border flex items-center justify-center text-on-surface font-headline font-bold text-[14px] uppercase shrink-0">
                        {match.name.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-headline text-[14px] font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                          {match.name}
                        </h4>
                        <p className="font-mono text-[11px] text-text-dim capitalize">
                          {match.experienceLevel || "Developer"}
                        </p>
                      </div>
                    </div>
                    {match.matchScore !== null && (
                      <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-sm rounded shrink-0">
                        {match.matchScore}% Match
                      </span>
                    )}
                  </div>

                  <p className="text-body-base text-text-muted line-clamp-2 leading-relaxed">
                    {match.bio || "No bio summary provided."}
                  </p>

                  <div className="flex flex-wrap gap-xs mt-auto pt-sm">
                    {match.skills.slice(0, 4).map((skill: string) => (
                      <span
                        key={skill}
                        className="font-mono text-[10px] bg-surface-container-high border border-border text-on-surface px-sm py-[2px] rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {match.skills.length > 4 && (
                      <span className="font-mono text-[10px] text-text-dim px-xs py-[2px]">
                        +{match.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Right Pane: Selected Match Profile Details Sidebar */}
      <aside className="w-[340px] shrink-0 bg-surface flex flex-col h-full overflow-y-auto hidden lg:flex">
        {selectedMatch ? (
          <div className="p-xl flex flex-col gap-xl">
            <div className="flex items-center gap-md border-b border-border pb-lg">
              <div className="w-[48px] h-[48px] rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-headline font-bold text-[18px] uppercase">
                {selectedMatch.name.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <h3 className="font-headline text-title-md font-bold text-on-surface truncate">{selectedMatch.name}</h3>
                <p className="text-[12px] text-text-muted truncate">{selectedMatch.email}</p>
              </div>
            </div>

            <div className="flex gap-sm w-full">
              <Button
                variant="primary"
                onClick={() => setInviteModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-xs font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">group_add</span>
                Invite Teammate
              </Button>
            </div>

            {selectedMatch.matchScore && (
              <div className="bg-surface-container-high/40 border border-border p-md rounded flex items-center gap-md">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center shrink-0">
                  <span className="font-mono text-[11px] font-bold text-on-surface">{selectedMatch.matchScore}%</span>
                </div>
                <div>
                  <h4 className="font-headline text-[13px] font-bold text-on-surface">Score Breakdown</h4>
                  <p className="text-[11px] text-text-muted mt-xs">High affinity match on technologies and hackathon goals.</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-sm">About Developer</h4>
              <p className="text-body-base text-text-muted leading-relaxed">
                {selectedMatch.bio || "This developer hasn't set up an about bio yet."}
              </p>
            </div>

            {selectedMatch.summary && (
              <div className="bg-surface-container-low border border-border rounded p-md">
                <h4 className="font-headline text-[12px] font-bold text-primary flex items-center gap-xs mb-xs">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  AI Match Summary
                </h4>
                <p className="text-[12px] text-text-muted leading-relaxed italic">
                  "{selectedMatch.summary}"
                </p>
              </div>
            )}

            <div className="flex flex-col gap-md">
              <div>
                <h4 className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-xs">Technical Skills</h4>
                <div className="flex flex-wrap gap-xs">
                  {selectedMatch.skills.map((skill: string) => (
                    <span key={skill} className="font-mono text-[10px] bg-background border border-border text-on-surface px-sm py-[2px] rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-xs">Interests</h4>
                <div className="flex flex-wrap gap-xs">
                  {selectedMatch.interests?.map((interest: string) => (
                    <span key={interest} className="font-mono text-[10px] bg-background border border-border text-text-muted px-sm py-[2px] rounded">
                      {interest}
                    </span>
                  )) || <span className="text-[11px] text-text-dim">No interests listed</span>}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-xs">Competitions</h4>
                <div className="flex flex-wrap gap-xs">
                  {selectedMatch.competitions?.map((comp: string) => (
                    <span key={comp} className="font-mono text-[10px] bg-background border border-border text-text-muted px-sm py-[2px] rounded">
                      {comp}
                    </span>
                  )) || <span className="text-[11px] text-text-dim">No competitions listed</span>}
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-xs">Availability</h4>
                <span className="font-mono text-[11px] bg-tertiary/10 border border-tertiary/20 text-tertiary px-sm py-[2px] rounded capitalize">
                  {selectedMatch.availability || "Not Specified"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-xl h-[400px] text-center">
            <span className="material-symbols-outlined text-[36px] text-text-dim mb-sm">person</span>
            <p className="text-body-base text-text-dim">Select a developer from the matches list to view full details.</p>
          </div>
        )}
      </aside>

      {/* Invite Member to Team Modal */}
      <Dialog isOpen={inviteModalOpen} onClose={() => setInviteModalOpen(false)} title={`Invite ${selectedMatch?.name}`}>
        <div className="flex flex-col gap-md">
          {actionError && (
            <div className="p-sm bg-error/10 border border-error/20 rounded text-[11px] text-error font-mono flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">error</span>
              <span>{actionError}</span>
            </div>
          )}

          {teams.length === 0 ? (
            <div className="text-center py-md flex flex-col gap-sm items-center">
              <p className="text-body-base text-text-muted">You haven't created any teams yet. Create a team first to invite developers.</p>
              <Button
                variant="primary"
                onClick={() => {
                  setInviteModalOpen(false)
                  setCreateTeamModalOpen(true)
                }}
              >
                Create Team & Add Teammate
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-sm">
              <p className="text-[12px] text-text-muted">Select one of your teams to add {selectedMatch?.name} to:</p>
              <div className="max-h-[200px] overflow-y-auto border border-border rounded divide-y divide-border">
                {teams.map((team) => (
                  <div key={team.id} className="p-sm flex items-center justify-between hover:bg-surface-hover transition-colors">
                    <div>
                      <h4 className="text-[12px] font-bold text-on-surface">{team.name}</h4>
                      <p className="text-[10px] text-text-muted font-mono">{team.members?.length || 0} Members</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      isLoading={actionLoading}
                      onClick={() => handleInviteToTeam(team.id)}
                    >
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Create Team Modal */}
      <Dialog isOpen={createTeamModalOpen} onClose={() => setCreateTeamModalOpen(false)} title="Create New Team">
        <form onSubmit={handleCreateTeamSubmit} className="flex flex-col gap-md">
          {actionError && (
            <div className="p-sm bg-error/10 border border-error/20 rounded text-[11px] text-error font-mono flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">error</span>
              <span>{actionError}</span>
            </div>
          )}

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Team Name</label>
            <Input
              type="text"
              placeholder="e.g. Hackathon Alpha"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              required
              disabled={actionLoading}
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Description (Optional)</label>
            <textarea
              placeholder="e.g. AI-powered matching interface hack"
              value={newTeamDesc}
              onChange={(e) => setNewTeamDesc(e.target.value)}
              disabled={actionLoading}
              rows={2}
              className="w-full bg-surface-container-lowest border border-border rounded px-sm py-xs text-on-surface font-mono text-[12px] placeholder:text-text-dim focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 resize-none"
            />
          </div>

          <p className="text-[11px] text-text-dim italic mt-xs">
            Note: Creating this team will automatically invite and add {selectedMatch?.name}.
          </p>

          <Button type="submit" variant="primary" className="w-full mt-sm" isLoading={actionLoading}>
            Create Team & Invite
          </Button>
        </form>
      </Dialog>
    </div>
  )
}
