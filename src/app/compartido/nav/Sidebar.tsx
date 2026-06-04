import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Box,
  Tooltip,
  Typography,
  Avatar,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  FolderOpen as TramitesIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  ChevronLeft,
  ChevronRight,
  Assignment as AsignacionIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { tokenHelper } from "../../utilidades/auth/tokenHelper";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

interface TokenPayload {
  name: string;
  nombre_rol: string;
}

const ETIQUETA_ROL: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  funcionario: "Funcionario",
  ciudadano: "Ciudadano",
  visitante: "Visitante",
};

function useUsuario() {
  const token = tokenHelper.get();
  if (!token) return null;
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string }[];
}

const MENU: MenuItem[] = [
  {
    label: "Inicio",
    icon: <DashboardIcon fontSize="small" />,
    path: "/dashboard",
  },
  {
    label: "Trámites",
    icon: <TramitesIcon fontSize="small" />,
    children: [
      { label: "Mis trámites", path: "/dashboard/tramites" },
      { label: "Iniciar trámite", path: "/dashboard/tramites/nuevo" },
    ],
  },
  {
    label: "Asignaciones",
    icon: <AsignacionIcon fontSize="small" />,
    path: "/dashboard/asignaciones",
  },
  {
    label: "Usuarios",
    icon: <PeopleIcon fontSize="small" />,
    children: [
      { label: "Listado", path: "/dashboard/usuarios" },
      { label: "Agregar", path: "/dashboard/usuarios/crear" },
    ],
  },
  {
    label: "Configuración",
    icon: <SettingsIcon fontSize="small" />,
    path: "/dashboard/configuracion",
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, collapsed, setCollapsed }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = useUsuario();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleSubMenu = (key: string) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (item: MenuItem) =>
    item.children?.some((c) => location.pathname.startsWith(c.path)) ?? false;

  const ir = (path: string) => {
    navigate(path);
    if (isMobile) onClose();
  };

  const cerrarSesion = () => {
    tokenHelper.remove();
    navigate("/");
  };

  // Estilos reutilizables
  const itemActiveBg = alpha(theme.palette.primary.main, 0.25);
  const itemHoverBg = alpha("#ffffff", 0.06);
  const textColor = theme.palette.sidebar.contrastText;
  const iconColor = theme.palette.sidebar.contrastText;

  const itemSx = (active: boolean) => ({
    mx: 1,
    my: 0.25,
    borderRadius: 2,
    px: collapsed ? 0 : 1.5,
    justifyContent: collapsed ? "center" : "flex-start",
    color: textColor,
    backgroundColor: active ? itemActiveBg : "transparent",
    borderLeft: active ? `3px solid ${theme.palette.primary.light}` : "3px solid transparent",
    "&:hover": { backgroundColor: active ? itemActiveBg : itemHoverBg },
    transition: "background-color 0.2s, border-color 0.2s",
    minHeight: 44,
  });

  const iconSx = {
    minWidth: 0,
    mr: collapsed ? 0 : 1.5,
    color: iconColor,
    justifyContent: "center",
  };

  const contenido = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── HEADER ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 1 : 2,
          py: 1.5,
          minHeight: 56,
        }}
      >
        {!collapsed && (
          <Typography
            variant="subtitle1"
            fontWeight={800}
            sx={{ color: theme.palette.secondary.main, letterSpacing: 1.5, fontSize: "0.95rem" }}
          >
            VUC-i
          </Typography>
        )}
        <Tooltip title={collapsed ? "Expandir" : "Contraer"} placement="right">
          <IconButton
            size="small"
            onClick={() => setCollapsed(!collapsed)}
            sx={{ color: textColor, "&:hover": { backgroundColor: itemHoverBg } }}
          >
            {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ borderColor: alpha("#ffffff", 0.08) }} />

      {/* ── MENÚ PRINCIPAL ── */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 1 }}>
        <List disablePadding>
          {MENU.map((item) => {
            const hasChildren = !!item.children;
            const active = item.path ? isActive(item.path) : isParentActive(item);

            return (
              <Box key={item.label}>
                <Tooltip
                  title={collapsed ? item.label : ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    onClick={() => {
                      if (hasChildren) toggleSubMenu(item.label);
                      else if (item.path) ir(item.path);
                    }}
                    sx={itemSx(active)}
                  >
                    <ListItemIcon sx={iconSx}>{item.icon}</ListItemIcon>
                    {!collapsed && (
                      <>
                        <ListItemText
                          primary={item.label}
                          slotProps={{
                            primary: { fontSize: "0.875rem", fontWeight: active ? 700 : 400 },
                          }}
                        />
                        {hasChildren &&
                          (openMenus[item.label] ? (
                            <ExpandLess fontSize="small" sx={{ color: iconColor, opacity: 0.7 }} />
                          ) : (
                            <ExpandMore fontSize="small" sx={{ color: iconColor, opacity: 0.7 }} />
                          ))}
                      </>
                    )}
                  </ListItemButton>
                </Tooltip>

                {/* Submenú */}
                {hasChildren && !collapsed && (
                  <Collapse in={!!openMenus[item.label]} timeout="auto" unmountOnExit>
                    <List disablePadding>
                      {item.children!.map((sub) => (
                        <ListItemButton
                          key={sub.path}
                          onClick={() => ir(sub.path)}
                          sx={{
                            ...itemSx(isActive(sub.path)),
                            pl: 4.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              bgcolor: isActive(sub.path)
                                ? theme.palette.primary.light
                                : alpha("#ffffff", 0.4),
                              mr: 1.5,
                              flexShrink: 0,
                            }}
                          />
                          <ListItemText
                            primary={sub.label}
                            slotProps={{
                              primary: { fontSize: "0.82rem", fontWeight: isActive(sub.path) ? 700 : 400 },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </List>
      </Box>

      {/* ── FOOTER: usuario + logout ── */}
      <Divider sx={{ borderColor: alpha("#ffffff", 0.08) }} />

      {/* Info usuario */}
      {usuario && !collapsed && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                fontSize: "0.8rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {iniciales(usuario.name)}
            </Avatar>
            <Box sx={{ overflow: "hidden" }}>
              <Typography
                variant="body2"
                fontWeight={700}
                noWrap
                sx={{ color: textColor, fontSize: "0.8rem" }}
              >
                {usuario.name}
              </Typography>
              <Chip
                label={ETIQUETA_ROL[usuario.nombre_rol] ?? usuario.nombre_rol}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.secondary.main, 0.2),
                  color: theme.palette.secondary.light,
                  "& .MuiChip-label": { px: 0.8 },
                }}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Avatar solo cuando está contraído */}
      {usuario && collapsed && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1.5 }}>
          <Tooltip title={usuario.name} placement="right">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              {iniciales(usuario.name)}
            </Avatar>
          </Tooltip>
        </Box>
      )}

      {/* Botón logout */}
      <Box sx={{ pb: 1 }}>
        <Tooltip title={collapsed ? "Cerrar sesión" : ""} placement="right" arrow>
          <ListItemButton
            onClick={cerrarSesion}
            sx={{
              mx: 1,
              borderRadius: 2,
              px: collapsed ? 0 : 1.5,
              justifyContent: collapsed ? "center" : "flex-start",
              color: alpha("#f87171", 0.85),
              minHeight: 44,
              "&:hover": {
                backgroundColor: alpha("#f87171", 0.1),
                color: "#f87171",
              },
              transition: "background-color 0.2s",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 1.5,
                color: "inherit",
                justifyContent: "center",
              }}
            >
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Cerrar sesión"
                slotProps={{ primary: { fontSize: "0.875rem", fontWeight: 500 } }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? open : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.standard,
          }),
          overflowX: "hidden",
          border: "none",
          backgroundColor: theme.palette.sidebar.main,
          boxShadow: "4px 0 24px rgba(0,0,0,0.25)",
        },
      }}
    >
      {contenido}
    </Drawer>
  );
};

export default Sidebar;
