import { createSlice } from "@reduxjs/toolkit";

const initialMode = localStorage.getItem("theme_mode") || "dark";
const initialColor = localStorage.getItem("color_theme") || "emerald";

const initialState = {
  themeMode: initialMode,
  colorTheme: initialColor,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleThemeMode: (state) => {
      const nextMode = state.themeMode === "dark" ? "light" : "dark";
      state.themeMode = nextMode;
      localStorage.setItem("theme_mode", nextMode);
    },
    setThemeMode: (state, action) => {
      state.themeMode = action.payload;
      localStorage.setItem("theme_mode", action.payload);
    },
    setColorTheme: (state, action) => {
      state.colorTheme = action.payload;
      localStorage.setItem("color_theme", action.payload);
    },
  },
});

export const { toggleThemeMode, setThemeMode, setColorTheme } = themeSlice.actions;
export default themeSlice.reducer;
