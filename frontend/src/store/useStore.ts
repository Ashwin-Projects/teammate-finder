import { create } from "zustand"
import { io, Socket } from "socket.io-client"

interface User {
  id: string
  name: string
  email: string
  profile?: any
}

interface State {
  token: string | null
  user: User | null
  profile: any | null
  matches: any[]
  teams: any[]
  messages: Record<string, any[]>
  activeTeamId: string | null
  socket: Socket | null
  authLoading: boolean
  profileLoading: boolean
  matchesLoading: boolean
  teamsLoading: boolean
  messagesLoading: boolean
  aiLoading: boolean
  savedSuggestions: any[]
  
  // Actions
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<any>
  signup: (name: string, email: string, password: string) => Promise<any>
  logout: () => void
  fetchCurrentUser: () => Promise<any>
  
  fetchProfile: () => Promise<any>
  updateProfile: (profileData: any) => Promise<any>
  generateSummary: () => Promise<any>
  
  fetchMatches: () => Promise<any>
  fetchMatchDetails: (userId: string) => Promise<any>
  
  fetchTeams: () => Promise<any>
  fetchTeamDetails: (teamId: string) => Promise<any>
  createTeam: (name: string, description: string, memberIds?: string[]) => Promise<any>
  addTeamMember: (teamId: string, userId: string) => Promise<any>
  removeTeamMember: (teamId: string, userId: string) => Promise<any>
  deleteTeam: (teamId: string) => Promise<any>
  
  fetchMessages: (teamId: string) => Promise<any>
  setActiveTeamId: (teamId: string | null) => void
  
  connectSocket: () => void
  disconnectSocket: () => void
  sendMessage: (teamId: string, content: string) => void
  
  generateTeamSuggestion: (data: {
    competitionDescription: string
    requiredSkills: string[]
    teamSize: number
    preferredTechnologies: string[]
  }) => Promise<any>
  saveSuggestion: (data: {
    competitionDescription: string
    generatedResponse: any
  }) => Promise<any>
  fetchSavedSuggestions: () => Promise<any>
}

// Helper to make API calls with the JWT token
const apiCall = async (url: string, method = "GET", body: any = null, token: string | null = null) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  
  const currentToken = token || localStorage.getItem("token")
  if (currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`
  }
  
  const options: RequestInit = {
    method,
    headers,
  }
  
  if (body) {
    options.body = JSON.stringify(body)
  }
  
  const response = await fetch(url, options)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong")
  }
  
  return data
}

export const useStore = create<State>((set, get) => ({
  token: localStorage.getItem("token"),
  user: null,
  profile: null,
  matches: [],
  teams: [],
  messages: {},
  activeTeamId: null,
  socket: null,
  authLoading: false,
  profileLoading: false,
  matchesLoading: false,
  teamsLoading: false,
  messagesLoading: false,
  aiLoading: false,
  savedSuggestions: [],

  setToken: (token) => {
    if (token) {
      localStorage.setItem("token", token)
    } else {
      localStorage.removeItem("token")
    }
    set({ token })
  },
  
  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ authLoading: true })
    try {
      const data = await apiCall("/api/auth/login", "POST", { email, password })
      get().setToken(data.token)
      set({ user: data.user, authLoading: false })
      get().connectSocket()
      return data.user
    } catch (error) {
      set({ authLoading: false })
      throw error
    }
  },

  signup: async (name, email, password) => {
    set({ authLoading: true })
    try {
      const data = await apiCall("/api/auth/signup", "POST", { name, email, password })
      get().setToken(data.token)
      set({ user: data.user, authLoading: false })
      get().connectSocket()
      return data.user
    } catch (error) {
      set({ authLoading: false })
      throw error
    }
  },

  logout: () => {
    get().disconnectSocket()
    get().setToken(null)
    set({ user: null, profile: null, matches: [], teams: [], messages: {}, activeTeamId: null })
  },

  fetchCurrentUser: async () => {
    const token = get().token
    if (!token) return null
    set({ authLoading: true })
    try {
      const data = await apiCall("/api/auth/me", "GET", null, token)
      set({ user: data.user, authLoading: false })
      get().connectSocket()
      return data.user
    } catch (error) {
      get().logout()
      set({ authLoading: false })
      throw error
    }
  },

  fetchProfile: async () => {
    set({ profileLoading: true })
    try {
      const data = await apiCall("/api/profile")
      set({ profile: data.profile, profileLoading: false })
      return data.profile
    } catch (error) {
      set({ profileLoading: false })
      throw error
    }
  },

  updateProfile: async (profileData) => {
    set({ profileLoading: true })
    try {
      const data = await apiCall("/api/profile", "PUT", profileData)
      set({ profile: data.profile, profileLoading: false })
      return data.profile
    } catch (error) {
      set({ profileLoading: false })
      throw error
    }
  },

  generateSummary: async () => {
    set({ profileLoading: true })
    try {
      const data = await apiCall("/api/profile/generate-summary", "POST")
      set((state) => ({
        profile: state.profile ? { ...state.profile, summary: data.summary } : null,
        profileLoading: false
      }))
      return data.summary
    } catch (error) {
      set({ profileLoading: false })
      throw error
    }
  },

  fetchMatches: async () => {
    set({ matchesLoading: true })
    try {
      const data = await apiCall("/api/match/find")
      set({ matches: data.matches, matchesLoading: false })
      return data.matches
    } catch (error) {
      set({ matchesLoading: false })
      throw error
    }
  },

  fetchMatchDetails: async (userId) => {
    try {
      return await apiCall(`/api/match/user/${userId}`)
    } catch (error) {
      throw error
    }
  },

  fetchTeams: async () => {
    set({ teamsLoading: true })
    try {
      const data = await apiCall("/api/team")
      set({ teams: data.teams, teamsLoading: false })
      
      // Connect to socket and join rooms for all teams
      const socket = get().socket
      if (socket && data.teams.length > 0) {
        data.teams.forEach((team: any) => {
          socket.emit("join_team", team.id)
        })
      }
      return data.teams
    } catch (error) {
      set({ teamsLoading: false })
      throw error
    }
  },

  fetchTeamDetails: async (teamId) => {
    try {
      return await apiCall(`/api/team/${teamId}`)
    } catch (error) {
      throw error
    }
  },

  createTeam: async (name, description, memberIds = []) => {
    try {
      const data = await apiCall("/api/team", "POST", { name, description, memberIds })
      set((state) => ({
        teams: [data.team, ...state.teams]
      }))
      const socket = get().socket
      if (socket) {
        socket.emit("join_team", data.team.id)
      }
      return data.team
    } catch (error) {
      throw error
    }
  },

  addTeamMember: async (teamId, userId) => {
    try {
      const data = await apiCall(`/api/team/${teamId}/members`, "POST", { userId })
      // Refresh team details/list
      get().fetchTeams()
      const socket = get().socket
      if (socket) {
        socket.emit("team_update", { teamId })
      }
      return data.member
    } catch (error) {
      throw error
    }
  },

  removeTeamMember: async (teamId, userId) => {
    try {
      await apiCall(`/api/team/${teamId}/members/${userId}`, "DELETE")
      get().fetchTeams()
      const socket = get().socket
      if (socket) {
        socket.emit("team_update", { teamId })
      }
    } catch (error) {
      throw error
    }
  },

  deleteTeam: async (teamId) => {
    try {
      await apiCall(`/api/team/${teamId}`, "DELETE")
      set((state) => ({
        teams: state.teams.filter((t) => t.id !== teamId),
        activeTeamId: state.activeTeamId === teamId ? null : state.activeTeamId
      }))
    } catch (error) {
      throw error
    }
  },

  fetchMessages: async (teamId) => {
    set({ messagesLoading: true })
    try {
      const data = await apiCall(`/api/chat/${teamId}`)
      set((state) => ({
        messages: {
          ...state.messages,
          [teamId]: data.messages
        },
        messagesLoading: false
      }))
      return data.messages
    } catch (error) {
      set({ messagesLoading: false })
      throw error
    }
  },

  setActiveTeamId: (teamId) => {
    set({ activeTeamId: teamId })
    if (teamId && !get().messages[teamId]) {
      get().fetchMessages(teamId)
    }
  },

  connectSocket: () => {
    const { socket, user, teams } = get()
    if (socket || !user) return

    // Since we proxy socket.io in vite.config.ts, we can connect to window.location.origin
    // or just fallback to same host
    const newSocket = io(window.location.origin, {
      transports: ["websocket"],
      autoConnect: true,
    })

    newSocket.on("connect", () => {
      console.log("Socket.io connected")
      // Join rooms for all current user teams
      if (teams.length > 0) {
        teams.forEach((team) => {
          newSocket.emit("join_team", team.id)
        })
      }
    })

    newSocket.on("receive_message", (message: any) => {
      const { teamId } = message
      
      // We need to match model properties. In backend/server.js:
      // io.to(teamId).emit('receive_message', {
      //   id: message.id,
      //   content: message.content,
      //   senderId: message.senderId,
      //   senderName: message.sender.name, // wait, senderName is sent as senderName. Let's make sure it translates to a Message structure:
      // })
      // Let's normalize it to fit message rendering.
      const normalizedMsg = {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt,
        sender: {
          id: message.senderId,
          name: message.senderName,
          email: ""
        }
      }

      set((state) => {
        const teamMsgs = state.messages[teamId] || []
        // Avoid duplicate messages
        if (teamMsgs.some((m) => m.id === normalizedMsg.id)) {
          return state
        }
        return {
          messages: {
            ...state.messages,
            [teamId]: [...teamMsgs, normalizedMsg]
          }
        }
      })
    })

    newSocket.on("team_updated", () => {
      console.log("Team updated, reloading teams...")
      get().fetchTeams()
    })

    set({ socket: newSocket })
  },

  disconnectSocket: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null })
    }
  },

  sendMessage: (teamId, content) => {
    const { socket, user } = get()
    if (!socket || !user) return

    // Emit send_message
    socket.emit("send_message", {
      teamId,
      senderId: user.id,
      content,
      senderName: user.name,
    })
  },

  generateTeamSuggestion: async (data) => {
    set({ aiLoading: true })
    try {
      const response = await apiCall("/api/ai/generate-team", "POST", data)
      set({ aiLoading: false })
      return response
    } catch (error) {
      set({ aiLoading: false })
      throw error
    }
  },

  saveSuggestion: async (data) => {
    try {
      const saved = await apiCall("/api/suggestions/save", "POST", data)
      set((state) => ({
        savedSuggestions: [saved.suggestion, ...state.savedSuggestions]
      }))
      return saved
    } catch (error) {
      throw error
    }
  },

  fetchSavedSuggestions: async () => {
    try {
      const data = await apiCall("/api/suggestions")
      set({ savedSuggestions: data.suggestions })
      return data.suggestions
    } catch (error) {
      throw error
    }
  }
}))
