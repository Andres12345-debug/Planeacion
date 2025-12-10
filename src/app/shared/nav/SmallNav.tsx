// SmallNav.jsx
import { AppBar, Toolbar, Box, IconButton, Button, Typography } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import logo from '../../../assets/img/nav/gov.com.co.png';


export default function Navbar() {
  return (
    <AppBar
      position="fixed"
      color="primary"
      elevation={0}
      sx={{
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar + 2, // arriba del otro AppBar
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: 48 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src={logo} alt="Logo" style={{ width: 110, height: 50}} />
        </Box>

        <Box sx={{ marginLeft: "auto" }}>
          <Button
            variant="outlined"
            startIcon={<LanguageIcon />}
            sx={{ color: "#fff", borderColor: "#fff" }}
            onClick={() => alert("Cambiar idioma")}
          >
            ES
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
