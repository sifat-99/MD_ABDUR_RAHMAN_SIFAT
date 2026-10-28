import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  activeSection: string;
  selectedProjectCategory: string;
  projectSearchTerm: string;
  isContactModalOpen: boolean;
  isDockMinimized: boolean;
  isChatDrawerOpen: boolean;
  isSidebarExpanded: boolean;
}

const initialState: UIState = {
  activeSection: "hero",
  selectedProjectCategory: "all",
  projectSearchTerm: "",
  isContactModalOpen: false,
  isDockMinimized: false,
  isChatDrawerOpen: false,
  isSidebarExpanded: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSection = action.payload;
    },
    setSelectedProjectCategory: (state, action: PayloadAction<string>) => {
      state.selectedProjectCategory = action.payload;
    },
    setProjectSearchTerm: (state, action: PayloadAction<string>) => {
      state.projectSearchTerm = action.payload;
    },
    setContactModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isContactModalOpen = action.payload;
    },
    toggleContactModal: (state) => {
      state.isContactModalOpen = !state.isContactModalOpen;
    },
    setDockMinimized: (state, action: PayloadAction<boolean>) => {
      state.isDockMinimized = action.payload;
    },
    toggleDock: (state) => {
      state.isDockMinimized = !state.isDockMinimized;
    },
    setChatDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isChatDrawerOpen = action.payload;
    },
    toggleChatDrawer: (state) => {
      state.isChatDrawerOpen = !state.isChatDrawerOpen;
    },
    setSidebarExpanded: (state, action: PayloadAction<boolean>) => {
      state.isSidebarExpanded = action.payload;
    },
    toggleSidebarExpanded: (state) => {
      state.isSidebarExpanded = !state.isSidebarExpanded;
    },
  },
});

export const {
  setActiveSection,
  setSelectedProjectCategory,
  setProjectSearchTerm,
  setContactModalOpen,
  toggleContactModal,
  setDockMinimized,
  toggleDock,
  setChatDrawerOpen,
  toggleChatDrawer,
  setSidebarExpanded,
  toggleSidebarExpanded,
} = uiSlice.actions;

export default uiSlice.reducer;
