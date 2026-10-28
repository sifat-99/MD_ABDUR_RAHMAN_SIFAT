import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Project, Skill } from "@/types/portfolio";

interface PortfolioDataState {
  projects: Project[];
  skills: Skill[];
  selectedCategory: string;
  searchFilter: string;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: PortfolioDataState = {
  projects: [],
  skills: [],
  selectedCategory: "all",
  searchFilter: "",
  status: "idle",
};

export const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    setPortfolioProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    setPortfolioSkills: (state, action: PayloadAction<Skill[]>) => {
      state.skills = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.searchFilter = action.payload;
    },
    addOptimisticProject: (state, action: PayloadAction<Project>) => {
      state.projects.unshift(action.payload);
    },
    removeOptimisticProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },
  },
});

export const {
  setPortfolioProjects,
  setPortfolioSkills,
  setCategoryFilter,
  setSearchFilter,
  addOptimisticProject,
  removeOptimisticProject,
} = portfolioSlice.actions;

export default portfolioSlice.reducer;
