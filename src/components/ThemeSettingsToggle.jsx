import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { setThemeMode, setColorTheme } from "../feature/theme/themeSlice";

const colorMap = {
  emerald: { id: "emerald", name: "Emerald", hex: "#0ed8ab" },
  ocean:   { id: "ocean",   name: "Ocean",   hex: "#0ea5e9" },
  violet:  { id: "violet",  name: "Violet",  hex: "#8b5cf6" },
  sunset:  { id: "sunset",  name: "Sunset",  hex: "#f97316" },
};

export default function ThemeSettingsToggle() {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const isEnglish = i18n.resolvedLanguage === "en";

  const theme = useSelector((state) => state.theme || { themeMode: "dark", colorTheme: "emerald" });
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setIsThemeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex items-center justify-center" ref={themeRef}>
      <button
        onClick={() => setIsThemeOpen(!isThemeOpen)}
        type="button"
        title="Customize Theme"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
        style={{
          border: `1px solid ${theme.themeMode === "light" ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)"}`,
          background: isThemeOpen
            ? theme.themeMode === "light" ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.12)"
            : theme.themeMode === "light" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.05)",
          color: theme.themeMode === "light" ? "#334155" : "#cbd5e1",
          boxShadow: isThemeOpen ? `0 0 0 2px ${colorMap[theme.colorTheme]?.hex || "#0ed8ab"}40` : "none",
        }}
      >
        <svg className="h-5 w-5 shrink-0 block m-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {isThemeOpen && (
        <div
          className="absolute right-0 mt-3 z-50 animate-fadeIn"
          style={{
            width: 272,
            borderRadius: 20,
            padding: "20px",
            background: theme.themeMode === "light" ? "rgba(255,255,255,0.97)" : "rgba(4,18,38,0.97)",
            border: `1px solid ${theme.themeMode === "light" ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.09)"}`,
            boxShadow: theme.themeMode === "light"
              ? "0 20px 48px -8px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)"
              : "0 20px 48px -8px rgba(0,0,0,0.7)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div style={{ display: "flex", gap: 4, marginBottom: 16, borderRadius: 8, overflow: "hidden", height: 4 }}>
            {Object.values(colorMap).map((c) => (
              <div key={c.hex} style={{ flex: 1, background: c.hex, opacity: theme.colorTheme === c.id ? 1 : 0.3, transition: "opacity 0.3s" }} />
            ))}
          </div>

          <h3 style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
            textTransform: "uppercase", marginBottom: 16,
            color: colorMap[theme.colorTheme]?.hex || "#0ed8ab",
          }}>
            {isEnglish ? "Theme Settings" : "Tùy biến giao diện"}
          </h3>

          <div style={{ marginBottom: 18 }}>
            <p style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color: theme.themeMode === "light" ? "#94a3b8" : "#475569", marginBottom: 10,
            }}>
              {isEnglish ? "Appearance" : "Chế độ"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { mode: "light", icon: "☀️", label: isEnglish ? "Light" : "Sáng" },
                { mode: "dark",  icon: "🌙", label: isEnglish ? "Dark"  : "Tối"  },
              ].map(({ mode, icon, label }) => {
                const isActiveMode = theme.themeMode === mode;
                const primaryHex = colorMap[theme.colorTheme]?.hex || "#0ed8ab";
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => dispatch(setThemeMode(mode))}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 6, padding: "8px 12px", borderRadius: 12, cursor: "pointer",
                      fontSize: 12, fontWeight: 600, transition: "all 0.2s ease",
                      border: isActiveMode
                        ? `1.5px solid ${primaryHex}60`
                        : `1px solid ${theme.themeMode === "light" ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.08)"}`,
                      background: isActiveMode
                        ? `${primaryHex}18`
                        : theme.themeMode === "light" ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
                      color: isActiveMode
                        ? primaryHex
                        : theme.themeMode === "light" ? "#64748b" : "#94a3b8",
                    }}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: 1, background: theme.themeMode === "light" ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.06)", marginBottom: 16 }} />

          <div>
            <p style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
              color: theme.themeMode === "light" ? "#94a3b8" : "#475569", marginBottom: 10,
            }}>
              {isEnglish ? "Color Preset" : "Chủ đề màu"}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.values(colorMap).map((c) => {
                const isActive = theme.colorTheme === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => dispatch(setColorTheme(c.id))}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "9px 12px", borderRadius: 12, cursor: "pointer",
                      fontSize: 12, fontWeight: 600, transition: "all 0.2s ease",
                      border: isActive
                        ? `1.5px solid ${c.hex}60`
                        : `1px solid ${theme.themeMode === "light" ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.07)"}`,
                      background: isActive
                        ? `${c.hex}18`
                        : theme.themeMode === "light" ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)",
                      color: isActive
                        ? c.hex
                        : theme.themeMode === "light" ? "#64748b" : "#94a3b8",
                      transform: isActive ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.hex, boxShadow: `0 0 6px ${c.hex}` }} />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
