import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type StudioTab =
  | "profile"
  | "projects"
  | "skills"
  | "services"
  | "experience"
  | "education"
  | "certifications"
  | "achievements"
  | "blogs"
  | "testimonials"
  | "contacts"
  | "navigation"
  | "settings"
  | "media"
  | "sync";

export interface StatusMessage {
  text: string;
  type: "success" | "error" | "info";
  timestamp?: number;
}

interface StudioState {
  activeTab: StudioTab;
  searchQuery: string;
  selectedId: string | null;
  isCreating: boolean;
  statusMessage: StatusMessage | null;
  itemCounts: {
    projects: number;
    skills: number;
    services: number;
    experience: number;
    education: number;
    certifications: number;
    achievements: number;
    blogs: number;
    testimonials: number;
    contacts: number;
    navigation: number;
  };
}

const initialState: StudioState = {
  activeTab: "profile",
  searchQuery: "",
  selectedId: null,
  isCreating: false,
  statusMessage: null,
  itemCounts: {
    projects: 0,
    skills: 0,
    services: 0,
    experience: 0,
    education: 0,
    certifications: 0,
    achievements: 0,
    blogs: 0,
    testimonials: 0,
    contacts: 0,
    navigation: 0,
  },
};

export const studioSlice = createSlice({
  name: "studio",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<StudioTab>) => {
      state.activeTab = action.payload;
      state.searchQuery = "";
      state.selectedId = null;
      state.isCreating = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedId: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },
    setIsCreating: (state, action: PayloadAction<boolean>) => {
      state.isCreating = action.payload;
    },
    setStatusMessage: (state, action: PayloadAction<StatusMessage | null>) => {
      state.statusMessage = action.payload;
    },
    clearStatusMessage: (state) => {
      state.statusMessage = null;
    },
    setItemCounts: (state, action: PayloadAction<Partial<StudioState["itemCounts"]>>) => {
      state.itemCounts = { ...state.itemCounts, ...action.payload };
    },
    updateItemCount: (
      state,
      action: PayloadAction<{ key: keyof StudioState["itemCounts"]; delta: number }>
    ) => {
      const { key, delta } = action.payload;
      state.itemCounts[key] = Math.max(0, (state.itemCounts[key] || 0) + delta);
    },
  },
});

export const {
  setActiveTab,
  setSearchQuery,
  setSelectedId,
  setIsCreating,
  setStatusMessage,
  clearStatusMessage,
  setItemCounts,
  updateItemCount,
} = studioSlice.actions;

export default studioSlice.reducer;
