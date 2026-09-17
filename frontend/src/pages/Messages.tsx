import React, { useEffect, useState, useRef } from "react"
import { useStore } from "../store/useStore"
import { Button } from "../components/ui/button"
import { Dialog } from "../components/ui/dialog"
import { Input } from "../components/ui/input"

interface TaskItem {
  id: string
  text: string
  completed: boolean
}

export const Messages: React.FC = () => {
  const {
    user,
    teams,
    fetchTeams,
    messages,
    activeTeamId,
    setActiveTeamId,
    sendMessage,
    matches,
    fetchMatches,
    createTeam,
  } = useStore()

  const [newMessage, setNewMessage] = useState("")
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamDesc, setNewTeamDesc] = useState("")
  const [selectedInvitees, setSelectedInvitees] = useState<string[]>([])
  
  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [newTaskText, setNewTaskText] = useState("")

  // Deadline countdown (simulated - 14 hrs 22 mins remaining)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 22, seconds: 0 })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load teams and matching candidates on mount
  useEffect(() => {
    fetchTeams()
    fetchMatches()
  }, [fetchTeams, fetchMatches])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, activeTeamId])

  // Sync tasks when active team changes
  useEffect(() => {
    if (activeTeamId) {
      const stored = localStorage.getItem(`tasks_${activeTeamId}`)
      if (stored) {
        setTasks(JSON.parse(stored))
      } else {
        // Seed default tasks
        const defaults: TaskItem[] = [
          { id: "1", text: "Setup Postgres Schema", completed: true },
          { id: "2", text: "Deploy staging env", completed: true },
          { id: "3", text: "Integrate LLM API", completed: false },
          { id: "4", text: "Write submission README", completed: false },
        ]
        setTasks(defaults)
        localStorage.setItem(`tasks_${activeTeamId}`, JSON.stringify(defaults))
      }
    }
  }, [activeTeamId])

  // Countdown timer simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else {
          clearInterval(timer)
          return prev
        }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeTeamId) return

    sendMessage(activeTeamId, newMessage.trim())
    setNewMessage("")
  }

  // Task handlers
  const handleToggleTask = (taskId: string) => {
    if (!activeTeamId) return
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    setTasks(updated)
    localStorage.setItem(`tasks_${activeTeamId}`, JSON.stringify(updated))
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskText.trim() || !activeTeamId) return

    const newTask: TaskItem = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
    }
    const updated = [...tasks, newTask]
    setTasks(updated)
    setNewTaskText("")
    localStorage.setItem(`tasks_${activeTeamId}`, JSON.stringify(updated))
  }

  // Create team handler
  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    try {
      const team = await createTeam(newTeamName, newTeamDesc, selectedInvitees)
      setActiveTeamId(team.id)
      setCreateTeamModalOpen(false)
      setNewTeamName("")
      setNewTeamDesc("")
      setSelectedInvitees([])
    } catch (err) {
      alert("Failed to create team")
    }
  }

  const handleToggleInvitee = (userId: string) => {
    setSelectedInvitees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const activeTeam = teams.find((t) => t.id === activeTeamId)
  const currentTeamMessages = activeTeamId ? messages[activeTeamId] || [] : []

  return (
    <div className="flex h-full min-h-0 relative overflow-hidden bg-background">
      {/* Left Pane: Team Channels list */}
      <aside className="w-[280px] shrink-0 bg-surface border-r border-border flex flex-col z-10 h-full">
        <div className="p-md border-b border-border flex items-center justify-between">
          <h2 className="font-headline text-title-md font-bold text-on-surface">Collaboration Rooms</h2>
          <button
            onClick={() => setCreateTeamModalOpen(true)}
            className="text-text-muted hover:text-on-surface transition-colors p-[2px] rounded hover:bg-surface-hover"
            title="Create Team"
          >
            <span className="material-symbols-outlined text-[20px]">edit_square</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {teams.length === 0 ? (
            <div className="p-xl text-center flex flex-col gap-sm items-center">
              <span className="material-symbols-outlined text-[28px] text-text-dim">group_off</span>
              <p className="text-[12px] text-text-dim">You aren't in any rooms yet.</p>
              <Button variant="outline" size="sm" onClick={() => setCreateTeamModalOpen(true)}>
                New Room
              </Button>
            </div>
          ) : (
            <div className="flex flex-col">
              {teams.map((team) => {
                const isActive = team.id === activeTeamId
                return (
                  <div
                    key={team.id}
                    onClick={() => setActiveTeamId(team.id)}
                    className={`p-md flex items-start gap-md cursor-pointer border-l-2 transition-all ${
                      isActive
                        ? "bg-surface-hover border-primary"
                        : "border-transparent hover:bg-surface-container-high/40"
                    }`}
                  >
                    <div className="w-[36px] h-[36px] rounded bg-secondary-container flex items-center justify-center text-on-background font-headline font-bold text-[12px] border border-border shrink-0">
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-[2px]">
                        <span className="font-headline text-[13px] font-bold text-on-surface truncate">
                          {team.name}
                        </span>
                      </div>
                      <p className="text-[12px] text-text-dim truncate">
                        {team.description || "Collab hub"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Center Pane: Conversation Area */}
      <section className="flex-1 flex flex-col bg-background min-w-0 relative h-full">
        {activeTeam ? (
          <>
            {/* Header */}
            <header className="h-[52px] border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-lg shrink-0 z-10">
              <div className="flex items-center gap-md min-w-0">
                <div className="w-[32px] h-[32px] rounded bg-secondary-container flex items-center justify-center text-on-background font-headline font-bold text-[11px] border border-border shrink-0">
                  {activeTeam.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-headline text-[14px] font-bold text-on-surface truncate">{activeTeam.name}</h2>
                  <p className="font-mono text-[9px] text-text-dim">
                    {activeTeam.members?.length || 1} Members
                  </p>
                </div>
              </div>
            </header>

            {/* Scrollable chat canvas */}
            <div className="flex-1 overflow-y-auto p-lg flex flex-col gap-lg no-scrollbar">
              <div className="flex justify-center my-xs">
                <span className="font-mono text-[10px] text-text-dim bg-surface border border-border px-sm py-[2px] rounded-full">
                  Collaboration Connected
                </span>
              </div>

              {currentTeamMessages.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center py-xl text-center text-text-dim">
                  <span className="material-symbols-outlined text-[32px] mb-xs">chat_bubble</span>
                  <p className="text-[12px]">No messages yet. Send a greeting to start the brainstorm!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-md">
                  {currentTeamMessages.map((msg: any) => {
                    const isSelf = msg.senderId === user?.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-sm max-w-[80%] ${
                          isSelf ? "self-end flex-row-reverse" : "self-start"
                        }`}
                      >
                        {!isSelf && (
                          <div className="w-[28px] h-[28px] rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] text-primary font-headline font-bold uppercase shrink-0">
                            {msg.sender?.name?.substring(0, 2) || "U"}
                          </div>
                        )}
                        <div className="flex flex-col gap-[2px]">
                          <div className={`flex items-baseline gap-sm ${isSelf ? "justify-end mr-xs" : "ml-xs"}`}>
                            <span className="font-headline text-[11px] font-semibold text-on-surface">
                              {isSelf ? "You" : msg.sender?.name || "User"}
                            </span>
                            <span className="font-mono text-[9px] text-text-dim">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div
                            className={`p-sm rounded text-body-base leading-relaxed border ${
                              isSelf
                                ? "bg-secondary-container border-border text-on-background rounded-br-none"
                                : "bg-surface border-border text-on-surface rounded-bl-none"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input field */}
            <form onSubmit={handleSendMessage} className="p-lg border-t border-border bg-surface shrink-0">
              <div className="bg-background border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded flex items-end p-xs transition-all">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-on-surface text-body-base p-xs max-h-[120px] placeholder:text-text-muted focus:ring-0"
                  placeholder="Type a message... (Enter to send)"
                  rows={1}
                />
                <div className="flex items-center gap-xs p-xs">
                  <button
                    type="submit"
                    className="w-[28px] h-[28px] bg-primary text-white rounded flex items-center justify-center hover:bg-primary-hover transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center mt-xs px-xs">
                <span className="font-mono text-[9px] text-text-dim">
                  Shift + Return for new line
                </span>
                <div className="flex items-center gap-xs font-mono text-[9px] text-tertiary">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                  Live Syncing Active
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-xl text-text-dim">
            <span className="material-symbols-outlined text-[48px] mb-sm">forum</span>
            <h3 className="text-title-md font-bold text-on-surface mb-xs">No active collaboration room</h3>
            <p className="text-body-base max-w-[340px]">
              Select a room from the left panel to brainstorm with your matched teammates, or create a new room.
            </p>
          </div>
        )}
      </section>

      {/* Right Pane: Countdown Widget & Task Checklist */}
      {activeTeamId && (
        <aside className="w-[260px] shrink-0 bg-surface border-l border-border flex flex-col h-full z-10 hidden xl:flex">
          {/* Submission Countdown Widget */}
          <div className="p-md border-b border-border bg-surface-container-high/20">
            <div className="flex items-center gap-sm mb-sm text-text-dim">
              <span className="material-symbols-outlined text-[16px] text-primary">timer</span>
              <h3 className="font-mono text-[9px] uppercase tracking-widest font-bold">Submission Countdown</h3>
            </div>
            <div className="flex gap-sm">
              <div className="flex-1 bg-background border border-border rounded p-sm flex flex-col items-center justify-center">
                <span className="font-headline text-[22px] font-bold text-on-surface leading-none">
                  {timeLeft.hours.toString().padStart(2, "0")}
                </span>
                <span className="font-mono text-[8px] text-text-dim uppercase mt-xs">HRS</span>
              </div>
              <div className="flex-1 bg-background border border-border rounded p-sm flex flex-col items-center justify-center">
                <span className="font-headline text-[22px] font-bold text-on-surface leading-none">
                  {timeLeft.minutes.toString().padStart(2, "0")}
                </span>
                <span className="font-mono text-[8px] text-text-dim uppercase mt-xs">MIN</span>
              </div>
              <div className="flex-1 bg-background border border-border rounded p-sm flex flex-col items-center justify-center">
                <span className="font-headline text-[22px] font-bold text-on-surface leading-none">
                  {timeLeft.seconds.toString().padStart(2, "0")}
                </span>
                <span className="font-mono text-[8px] text-text-dim uppercase mt-xs">SEC</span>
              </div>
            </div>
          </div>

          {/* Checklist Widget */}
          <div className="flex-grow overflow-y-auto p-md flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-[13px] font-bold text-on-surface">Team Checklist</h3>
              <span className="font-mono text-[10px] bg-surface-container border border-border text-on-surface px-sm rounded">
                {tasks.filter((t) => t.completed).length}/{tasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-sm">
              {tasks.map((task) => (
                <label
                  key={task.id}
                  className="flex items-start gap-sm cursor-pointer p-xs rounded hover:bg-surface-hover transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="mt-[3px] h-3.5 w-3.5 rounded border-border bg-surface text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <span
                    className={`text-[12px] leading-tight transition-colors ${
                      task.completed ? "text-text-dim line-through decoration-text-dim/50" : "text-on-surface"
                    }`}
                  >
                    {task.text}
                  </span>
                </label>
              ))}
            </div>

            <form onSubmit={handleAddTask} className="mt-xs">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-xs text-[16px] text-text-dim">add</span>
                <input
                  type="text"
                  placeholder="Add item..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-border border-dashed focus:border-solid focus:border-primary text-[11px] font-mono text-on-surface h-[28px] pl-7 pr-sm rounded outline-none placeholder:text-text-dim transition-all"
                />
              </div>
            </form>
          </div>
        </aside>
      )}

      {/* Create Team Room Dialog */}
      <Dialog isOpen={createTeamModalOpen} onClose={() => setCreateTeamModalOpen(false)} title="Create Collaboration Room">
        <form onSubmit={handleCreateTeamSubmit} className="flex flex-col gap-md">
          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Room Name</label>
            <Input
              type="text"
              placeholder="e.g. Hackathon Alpha Team"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Description (Optional)</label>
            <textarea
              placeholder="e.g. Frontend team for Web3 Matchmaking hack"
              value={newTeamDesc}
              onChange={(e) => setNewTeamDesc(e.target.value)}
              rows={2}
              className="w-full bg-surface-container-lowest border border-border rounded px-sm py-xs text-on-surface font-mono text-[12px] placeholder:text-text-dim focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          {matches.length > 0 && (
            <div className="flex flex-col gap-xs">
              <label className="font-mono text-[10px] text-text-dim uppercase tracking-wider">Invite Candidates</label>
              <div className="max-h-[140px] overflow-y-auto border border-border rounded divide-y divide-border">
                {matches.map((match) => {
                  const isChecked = selectedInvitees.includes(match.userId)
                  return (
                    <div
                      key={match.userId}
                      onClick={() => handleToggleInvitee(match.userId)}
                      className="p-sm flex items-center justify-between cursor-pointer hover:bg-surface-hover"
                    >
                      <div>
                        <h4 className="text-[12px] font-bold text-on-surface">{match.name}</h4>
                        <p className="text-[10px] text-text-dim capitalize">{match.experienceLevel}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="h-3.5 w-3.5 rounded border-border bg-surface text-primary focus:ring-primary"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full mt-sm">
            Create Room & Invite
          </Button>
        </form>
      </Dialog>
    </div>
  )
}
