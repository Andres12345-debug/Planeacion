// src/components/TopNavigation.tsx
import * as React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import { alpha, styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { DarkMode, LightMode, Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import { useThemeContext } from "../theme/ThemeConext";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import logo from "../../../assets/img/nav/Logo_Alcaldía_Mayor_de_Tunja.png";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  width: "100%",
  [theme.breakpoints.up("sm")]: { width: "320px" },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

export default function TopNavigation() {
  const { mode, toggleTheme } = useThemeContext();
  const navigate = useNavigate();
  const location = useLocation();

  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md")); // show center links + full search on md+
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const [busqueda, setBusqueda] = React.useState("");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const q = busqueda.trim();
    if (!q) return;
    const id = setTimeout(() => {
      if (q.length < 2) return;
      const target = `/land/buscar/${encodeURIComponent(q)}`;
      if (location.pathname !== target) navigate(target);
      setBusqueda("");
    }, 600);
    return () => clearTimeout(id);
  }, [busqueda, navigate, location.pathname]);

  // Nav links
  const navLinks = [
    { label: "INICIO", to: "/land" },
    { label: "QUIÉNES SOMOS", to: "/quienes-somos" },
    { label: "TRÁMITES", to: "/tramites" },
    { label: "BLOG", to: "/blog" },
  ];

  const toggleDrawer = (open: boolean) => () => setDrawerOpen(open);

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          top: 48, // debajo del SmallNav (si existe)
          bgcolor: "background.paper",
          color: "text.primary",
          zIndex: (t) => t.zIndex.appBar,
          boxShadow: "none",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Toolbar sx={{ display: "flex", alignItems: "center", gap: 2, px: { xs: 1, sm: 3, md: 6 } }}>
          {/* Left: hamburger (xs/sm) or spacer */}
          {!isMdUp ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Box sx={{ width: 40 }} /> // keep spacing when menu not visible
          )}

          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
            <Link to="/land" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <Box
                component="img"
                src={logo}
                alt="Logo Alcaldía"
                sx={{
                  height: { xs: 48, sm: 64, md: 60 },
                  objectFit: "contain",
                  pr: 1,
                }}
              />
            </Link>
          </Box>

          {/* Center: nav links (only md up) */}
          {isMdUp && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "auto",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  alignItems: "center",
                  "& a": {
                    textDecoration: "none",
                    color: (t) => (t.palette.mode === "light" ? t.palette.text.primary : t.palette.common.white),
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    letterSpacing: 0.2,
                  },
                }}
              >
                {navLinks.map((ln) => (
                  <Link key={ln.to} to={ln.to}>
                    {ln.label}
                  </Link>
                ))}
              </Box>
            </Box>
          )}

          {/* Right: search + theme toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: isMdUp ? 0 : "auto" }}>
            {/* Full search on md+ */}
            {isMdUp ? (
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Buscar…"
                  inputProps={{ "aria-label": "buscar" }}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </Search>
            ) : (
              // Small screens: search icon opens dialog
              <IconButton
                aria-label="buscar"
                onClick={() => setSearchDialogOpen(true)}
                color="inherit"
                size="large"
              >
                <SearchIcon />
              </IconButton>
            )}

            {/* Theme toggle */}
            <IconButton onClick={toggleTheme} color="inherit" sx={{ ml: 0.5 }}>
              {mode === "light" ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer so content doesn't hide under fixed AppBar */}
      <Toolbar />

      {/* Drawer for small screens */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 300 }} role="presentation" onKeyDown={toggleDrawer(false)}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="img" src={logo} alt="logo" sx={{ height: 48, objectFit: "contain" }} />
            </Box>
            <IconButton onClick={toggleDrawer(false)} aria-label="cerrar">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          <List>
            {navLinks.map((ln) => (
              <ListItem key={ln.to} disablePadding onClick={toggleDrawer(false)}>
                <ListItemButton component={Link} to={ln.to}>
                  <ListItemText primary={ln.label} />
                </ListItemButton>
              </ListItem>
            ))}

            <Divider sx={{ my: 1 }} />

            {/* Search inside drawer for small screens */}
            <Box sx={{ px: 2, py: 1 }}>
              <Search sx={{ width: "100%" }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Buscar…"
                  inputProps={{ "aria-label": "buscar drawer" }}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </Search>
            </Box>
          </List>
        </Box>
      </Drawer>

      {/* Search Dialog for very small devices (opened by search icon) */}
      <Dialog fullWidth open={searchDialogOpen} onClose={() => setSearchDialogOpen(false)}>
        <DialogTitle>Buscar</DialogTitle>
        <DialogContent>
          <Search sx={{ width: "100%" }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Buscar…"
              inputProps={{ "aria-label": "buscar dialog" }}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
            />
          </Search>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
