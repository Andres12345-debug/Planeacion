import { IconButton } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { PaletteMode } from "@mui/material";

type MainContentProps = {
  toggleTheme: () => void;
  mode: PaletteMode;
};

export default function MainContent({ toggleTheme, mode }: MainContentProps) {
  return (
    <div style={{ padding: 20 }}>
      <IconButton onClick={toggleTheme} color="inherit">
        {mode === "light" ? <DarkMode /> : <LightMode />}
      </IconButton>
      <h1>Hola, este es el modo {mode}</h1>
    </div>
  );
}
