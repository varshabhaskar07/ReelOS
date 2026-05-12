import { create } from 'zustand'
import { channelsApi } from '@/api/client'

const useAppStore = create((set, get) => ({
  // ── Channels ────────────────────────────────────────────────────────────────
  channels: [],
  channelsLoading: false,
  channelsError: null,

  fetchChannels: async () => {
    set({ channelsLoading: true, channelsError: null })
    try {
      const data = await channelsApi.list()
      set({ channels: data, channelsLoading: false })
    } catch (err) {
      set({ channelsError: err.message, channelsLoading: false })
    }
  },

  addChannel: (channel) =>
    set((state) => ({ channels: [channel, ...state.channels] })),

  updateChannel: (id, updates) =>
    set((state) => ({
      channels: state.channels.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  removeChannel: (id) =>
    set((state) => ({ channels: state.channels.filter((c) => c.id !== id) })),

  // ── Generation ──────────────────────────────────────────────────────────────
  generationResult: null,
  generationError: null,
  isGenerating: false,

  setGenerationResult: (result) => set({ generationResult: result }),
  setGenerationError: (error) => set({ generationError: error }),
  setIsGenerating: (val) => set({ isGenerating: val }),
  clearGeneration: () => set({ generationResult: null, generationError: null }),

  // ── Selected channel (persisted across nav) ─────────────────────────────────
  selectedChannelId: null,
  setSelectedChannelId: (id) => set({ selectedChannelId: id }),

  // ── Helpers ──────────────────────────────────────────────────────────────────
  getChannelById: (id) => get().channels.find((c) => c.id === id) || null,
}))

export default useAppStore
