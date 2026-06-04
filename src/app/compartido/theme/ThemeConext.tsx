import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import {
  createTheme,
  ThemeProvider,
  PaletteMode,
  CssBaseline,
} from "@mui/material";

// ── Extensión de la paleta MUI ──────────────────────────────────────────────
declare module "@mui/material/styles" {
  interface Palette {
    accent: { main: string; contrastText: string };
    neutral: { main: string; contrastText: string };
    sidebar: { main: string; contrastText: string };
  }
  interface PaletteOptions {
    accent?: { main: string; contrastText: string };
    neutral?: { main: string; contrastText: string };
    sidebar?: { main: string; contrastText: string };
  }
}

// ── Tokens de color ─────────────────────────────────────────────────────────
//  Basados en la escala Slate + Blue de Tailwind CSS
//  Primario:   Azul institucional  (#1d4ed8 light / #3b82f6 dark)
//  Secundario: Teal refinado       (#0d9488 light / #2dd4bf dark)
//  Sidebar:    Slate-900 siempre oscuro, independiente del modo
//  Accent:     Ámbar para highlights y advertencias

const TOKENS = {
  // Azul institucional
  blue900: "#1e3a8a",
  blue800: "#1e40af",
  blue700: "#1d4ed8",
  blue600: "#2563eb",
  blue500: "#3b82f6",
  blue400: "#60a5fa",

  // Teal secundario
  teal700: "#0f766e",
  teal600: "#0d9488",
  teal500: "#14b8a6",
  teal400: "#2dd4bf",
  teal300: "#5eead4",

  // Slate (grises/neutros)
  slate950: "#020617",
  slate900: "#0f172a",
  slate800: "#1e293b",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate300: "#cbd5e1",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50:  "#f8fafc",

  // Accent ámbar
  amber500: "#f59e0b",
  amber900: "#78350f",

  white: "#ffffff",
} as const;

// ── Contexto ─────────────────────────────────────────────────────────────────
type ThemeContextType = { mode: PaletteMode; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext debe usarse dentro de ThemeContextProvider");
  return ctx;
};

// ── Provider ─────────────────────────────────────────────────────────────────
export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<PaletteMode>(
    (localStorage.getItem("themeMode") as PaletteMode) || "light"
  );

  // Detectar preferencia del sistema en el primer render
  useEffect(() => {
    if (!localStorage.getItem("themeMode")) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () =>
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", next);
      return next;
    });

  const theme = useMemo(() => {
    const isLight = mode === "light";

    return createTheme({
      palette: {
        mode,

        // ── Primario ──────────────────────────────────────────────────────
        primary: {
          light:        isLight ? TOKENS.blue500 : TOKENS.blue400,
          main:         isLight ? TOKENS.blue700 : TOKENS.blue500,
          dark:         isLight ? TOKENS.blue800 : TOKENS.blue700,
          contrastText: TOKENS.white,
        },

        // ── Secundario ────────────────────────────────────────────────────
        secondary: {
          light:        isLight ? TOKENS.teal500 : TOKENS.teal300,
          main:         isLight ? TOKENS.teal600 : TOKENS.teal400,
          dark:         isLight ? TOKENS.teal700 : TOKENS.teal600,
          contrastText: TOKENS.white,
        },

        // ── Fondo ─────────────────────────────────────────────────────────
        background: {
          default: isLight ? TOKENS.slate100 : TOKENS.slate900,
          paper:   isLight ? TOKENS.white     : TOKENS.slate800,
        },

        // ── Texto ─────────────────────────────────────────────────────────
        text: {
          primary:   isLight ? TOKENS.slate900 : TOKENS.slate100,
          secondary: isLight ? TOKENS.slate500 : TOKENS.slate400,
          disabled:  isLight ? TOKENS.slate400 : TOKENS.slate600,
        },

        // ── Divisores ─────────────────────────────────────────────────────
        divider: isLight ? TOKENS.slate200 : TOKENS.slate700,

        // ── Custom: Sidebar ───────────────────────────────────────────────
        sidebar: {
          main:         TOKENS.slate900,   // siempre oscuro, independiente del modo
          contrastText: TOKENS.slate200,
        },

        // ── Custom: Accent ────────────────────────────────────────────────
        accent: {
          main:         TOKENS.amber500,
          contrastText: TOKENS.amber900,
        },

        // ── Custom: Neutral ───────────────────────────────────────────────
        neutral: {
          main:         TOKENS.slate500,
          contrastText: TOKENS.white,
        },
      },

      // ── Tipografía ────────────────────────────────────────────────────────
      typography: {
        fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
        h1: { fontSize: "2.25rem",  fontWeight: 800, lineHeight: 1.2 },
        h2: { fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.25 },
        h3: { fontSize: "1.5rem",   fontWeight: 700, lineHeight: 1.3 },
        h4: { fontSize: "1.25rem",  fontWeight: 600, lineHeight: 1.4 },
        h5: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.4 },
        h6: { fontSize: "1rem",     fontWeight: 600, lineHeight: 1.5 },
        subtitle1: { fontSize: "0.95rem",  fontWeight: 500, lineHeight: 1.5 },
        subtitle2: { fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.5 },
        body1:     { fontSize: "1rem",     fontWeight: 400, lineHeight: 1.6 },
        body2:     { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5 },
        button:    { fontSize: "0.875rem", fontWeight: 600, textTransform: "none" },
        caption:   { fontSize: "0.75rem",  fontWeight: 400, lineHeight: 1.5 },
        overline:  { fontSize: "0.7rem",   fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" },
      },

      // ── Shape ─────────────────────────────────────────────────────────────
      shape: { borderRadius: 10 },

      // ── z-index ───────────────────────────────────────────────────────────
      zIndex: { appBar: 1100, modal: 1300 },

      // ── Overrides globales de componentes ─────────────────────────────────
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { boxShadow: "none" },
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: { borderRadius: 10 },
          },
        },
        MuiPaper: {
          styleOverrides: {
            rounded: { borderRadius: 16 },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: { fontWeight: 600 },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: { fontSize: "0.78rem" },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
