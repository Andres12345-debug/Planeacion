import React, { useEffect, useMemo, useState } from "react";
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
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  FolderOpen as TramitesIcon,
  People as PeopleIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  ChevronLeft,
  ChevronRight,
  AccountTree as WorkflowIcon,
  Visibility as VisitanteIcon,
  HomeWork as BrandIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { tokenHelper } from "../../utilidades/auth/tokenHelper";
import { useUsuarioToken } from "../../utilidades/auth/usuarioToken";
import { ROL_CONFIG } from "../../utilidades/dominios/roles";

// ── Constantes ────────────────────────────────────────────────────────────────

const DRAWER_WIDTH = 268;
const COLLAPSED_WIDTH = 68;

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface SubItem {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: SubItem[];
  seccion?: string; // encabezado de grupo que aparece sobre este ítem
}

// ── Menús por rol ─────────────────────────────────────────────────────────────

const MENU_ADMIN: MenuItem[] = [
  { label: "Inicio",    icon: <DashboardIcon />, path: "/dashboard" },
  {
    label: "Workflows", icon: <WorkflowIcon />, seccion: "Administración",
    children: [
      { label: "Listar workflows", path: "/dashboard/admin/workflows" },
      { label: "Crear workflow",   path: "/dashboard/admin/workflows/crear" },
    ],
  },
  {
    label: "Usuarios", icon: <PeopleIcon />,
    children: [
      { label: "Listado",         path: "/dashboard/admin/usuarios" },
      { label: "Agregar usuario", path: "/dashboard/admin/usuarios/crear" },
    ],
  },
  { label: "Trámites", icon: <TramitesIcon />, path: "/dashboard/admin/tramites", seccion: "Operaciones" },
];

const MENU_SUPERVISOR: MenuItem[] = [
  { label: "Inicio",    icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Trámites", icon: <TramitesIcon />,  path: "/dashboard/tramites", seccion: "Mi departamento" },
];

const MENU_FUNCIONARIO: MenuItem[] = [
  { label: "Inicio",    icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Trámites", icon: <TramitesIcon />,  path: "/dashboard/tramites", seccion: "Trabajo" },
];

const MENU_CIUDADANO: MenuItem[] = [
  { label: "Inicio", icon: <DashboardIcon />, path: "/dashboard" },
];

const MENU_VISITANTE: MenuItem[] = [
  { label: "Inicio",    icon: <DashboardIcon />,  path: "/dashboard" },
  { label: "Trámites", icon: <VisitanteIcon />, path: "/dashboard/tramites", seccion: "Consulta" },
];

const MENUS_POR_ROL: Record<string, MenuItem[]> = {
  admin: MENU_ADMIN,
  supervisor: MENU_SUPERVISOR,
  funcionario: MENU_FUNCIONARIO,
  ciudadano: MENU_CIUDADANO,
  visitante: MENU_VISITANTE,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function iniciales(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, collapsed, setCollapsed }) => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate  = useNavigate();
  const location  = useLocation();
  const usuario   = useUsuarioToken();

  const menu = useMemo<MenuItem[]>(
    () => MENUS_POR_ROL[usuario?.nombre_rol ?? ""] ?? MENU_CIUDADANO,
    [usuario?.nombre_rol],
  );

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenMenus((prev) => {
      const next = { ...prev };
      menu.forEach((item) => {
        if (item.children?.some((c) => location.pathname.startsWith(c.path))) {
          next[item.label] = true;
        }
      });
      return next;
    });
  }, [location.pathname, menu]);

  const toggleSubMenu = (key: string) =>
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));

  const isActive       = (path: string)   => location.pathname === path;
  const isParentActive = (item: MenuItem) =>
    item.children?.some((c) => location.pathname.startsWith(c.path)) ?? false;

  const ir = (path: string) => { navigate(path); if (isMobile) onClose(); };
  const cerrarSesion = () => { tokenHelper.remove(); navigate("/"); };

  // ── Colores ────────────────────────────────────────────────────────────────

  const bg          = "#0f172a";               // slate-900 siempre
  const textPrimary = "#e2e8f0";               // slate-200
  const textMuted   = "#64748b";               // slate-500
  const activeBg    = theme.palette.primary.main;
  const hoverBg     = alpha("#ffffff", 0.05);
  const subLineBg   = alpha("#ffffff", 0.08);
  const rolColor    = ROL_CONFIG[usuario?.nombre_rol ?? ""]?.color ?? textMuted;

  // ── Item principal ─────────────────────────────────────────────────────────

  const renderItem = (item: MenuItem) => {
    const hasChildren = !!item.children;
    const active      = item.path ? isActive(item.path) : isParentActive(item);
    const isOpen      = !!openMenus[item.label];

    return (
      <Box key={item.label}>
        {/* Encabezado de sección */}
        {item.seccion && !collapsed && (
          <Typography
            variant="overline"
            sx={{
              display: "block",
              px: 2.5,
              pt: 2,
              pb: 0.5,
              color: textMuted,
              fontSize: "0.65rem",
              letterSpacing: 1.4,
              userSelect: "none",
            }}
          >
            {item.seccion}
          </Typography>
        )}

        <Tooltip title={collapsed ? item.label : ""} placement="right" arrow>
          <ListItemButton
            onClick={() => { if (hasChildren) toggleSubMenu(item.label); else if (item.path) ir(item.path); }}
            sx={{
              mx: 1.5,
              my: 0.25,
              borderRadius: 2,
              px: collapsed ? 0 : 1.5,
              minHeight: 42,
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 0,
              color: active ? "#fff" : textPrimary,
              bgcolor: active ? activeBg : "transparent",
              boxShadow: active
                ? `0 4px 14px ${alpha(activeBg, 0.45)}`
                : "none",
              "&:hover": {
                bgcolor: active ? activeBg : hoverBg,
                "& .menu-icon": { color: "#fff" },
              },
              transition: "background-color 0.15s, box-shadow 0.15s",
            }}
          >
            <ListItemIcon
              className="menu-icon"
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 1.5,
                justifyContent: "center",
                color: active ? "#fff" : alpha(textPrimary, 0.7),
                "& svg": { fontSize: "1.2rem" },
                transition: "color 0.15s",
              }}
            >
              {item.icon}
            </ListItemIcon>

            {!collapsed && (
              <>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      fontSize: "0.85rem",
                      fontWeight: active ? 700 : 500,
                      lineHeight: 1,
                    },
                  }}
                  sx={{ my: 0 }}
                />
                {hasChildren && (
                  isOpen
                    ? <ExpandLess sx={{ fontSize: "1rem", color: active ? "#fff" : textMuted }} />
                    : <ExpandMore sx={{ fontSize: "1rem", color: active ? "#fff" : textMuted }} />
                )}
              </>
            )}
          </ListItemButton>
        </Tooltip>

        {/* Sub-ítems */}
        {hasChildren && !collapsed && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List disablePadding sx={{ position: "relative", ml: 3.5, mr: 1.5, mt: 0.25, mb: 0.5 }}>
              {/* Línea vertical conectora */}
              <Box
                sx={{
                  position: "absolute",
                  left: 12,
                  top: 4,
                  bottom: 4,
                  width: "1px",
                  bgcolor: subLineBg,
                  borderRadius: 1,
                }}
              />
              {item.children!.map((sub) => {
                const subActive = isActive(sub.path);
                return (
                  <ListItemButton
                    key={sub.path}
                    onClick={() => ir(sub.path)}
                    sx={{
                      borderRadius: 1.5,
                      pl: 3,
                      pr: 1,
                      py: 0.6,
                      minHeight: 34,
                      color: subActive ? "#fff" : alpha(textPrimary, 0.65),
                      bgcolor: subActive ? alpha(activeBg, 0.9) : "transparent",
                      "&:hover": {
                        bgcolor: subActive ? alpha(activeBg, 0.9) : hoverBg,
                        color: "#fff",
                      },
                      transition: "background-color 0.15s",
                    }}
                  >
                    {/* Nodo en la línea */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: 8,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        border: `2px solid`,
                        borderColor: subActive ? activeBg : subLineBg,
                        bgcolor: subActive ? activeBg : bg,
                        transition: "border-color 0.15s, background-color 0.15s",
                      }}
                    />
                    <ListItemText
                      primary={sub.label}
                      slotProps={{
                        primary: {
                          fontSize: "0.8rem",
                          fontWeight: subActive ? 700 : 400,
                        },
                      }}
                      sx={{ my: 0 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  // ── Contenido del drawer ───────────────────────────────────────────────────

  const contenido = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: bg }}>

      {/* ── LOGO ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 1 : 2,
          minHeight: 60,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.18)} 0%, transparent 70%)`,
          borderBottom: `1px solid ${alpha("#ffffff", 0.06)}`,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.5,
                bgcolor: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.5)}`,
              }}
            >
              <BrandIcon sx={{ fontSize: "1rem", color: "#fff" }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.1,
                  letterSpacing: 0.3,
                }}
              >
                VentanillaÚnica
              </Typography>
              <Typography sx={{ fontSize: "0.6rem", color: textMuted, letterSpacing: 0.5 }}>
                Alcaldía de Tunja
              </Typography>
            </Box>
          </Box>
        )}

        {collapsed && (
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              bgcolor: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
            }}
          >
            <BrandIcon sx={{ fontSize: "1.1rem", color: "#fff" }} />
          </Box>
        )}

        {!collapsed && (
          <Tooltip title="Contraer" placement="right">
            <IconButton
              size="small"
              onClick={() => setCollapsed(true)}
              sx={{ color: textMuted, "&:hover": { color: "#fff", bgcolor: hoverBg } }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Botón expandir (solo cuando está colapsado) */}
      {collapsed && (
        <Tooltip title="Expandir" placement="right">
          <IconButton
            size="small"
            onClick={() => setCollapsed(false)}
            sx={{
              alignSelf: "center",
              mt: 1,
              color: textMuted,
              "&:hover": { color: "#fff", bgcolor: hoverBg },
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* ── PERFIL DE USUARIO ── */}
      {usuario && (
        <Box
          sx={{
            mx: 1.5,
            mt: 2,
            mb: 1,
            p: collapsed ? 0.75 : 1.5,
            borderRadius: 2,
            bgcolor: alpha("#ffffff", 0.04),
            border: `1px solid ${alpha("#ffffff", 0.07)}`,
            display: "flex",
            alignItems: "center",
            gap: collapsed ? 0 : 1.25,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <Tooltip title={collapsed ? `${usuario.name} — ${ROL_CONFIG[usuario.nombre_rol]?.label}` : ""} placement="right">
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: alpha(rolColor, 0.25),
                color: rolColor,
                fontSize: "0.75rem",
                fontWeight: 800,
                border: `2px solid ${alpha(rolColor, 0.4)}`,
                flexShrink: 0,
              }}
            >
              {iniciales(usuario.name)}
            </Avatar>
          </Tooltip>

          {!collapsed && (
            <Box sx={{ overflow: "hidden", flex: 1 }}>
              <Typography
                noWrap
                sx={{ fontSize: "0.8rem", fontWeight: 700, color: textPrimary, lineHeight: 1.2 }}
              >
                {usuario.name}
              </Typography>
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  mt: 0.4,
                  px: 0.8,
                  py: 0.1,
                  borderRadius: 0.75,
                  bgcolor: alpha(rolColor, 0.18),
                  color: rolColor,
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {ROL_CONFIG[usuario.nombre_rol]?.label ?? usuario.nombre_rol}
              </Box>
            </Box>
          )}
        </Box>
      )}

      <Divider sx={{ mx: 1.5, borderColor: alpha("#ffffff", 0.06), mb: 0.5 }} />

      {/* ── NAVEGACIÓN ── */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 0.5 }}>
        <List disablePadding>
          {menu.map(renderItem)}
        </List>
      </Box>

      {/* ── LOGOUT ── */}
      <Box
        sx={{
          px: 1.5,
          py: 1.5,
          borderTop: `1px solid ${alpha("#ffffff", 0.06)}`,
        }}
      >
        <Tooltip title={collapsed ? "Cerrar sesión" : ""} placement="right" arrow>
          <ListItemButton
            onClick={cerrarSesion}
            sx={{
              borderRadius: 2,
              px: collapsed ? 0 : 1.5,
              minHeight: 40,
              justifyContent: collapsed ? "center" : "flex-start",
              color: alpha("#f87171", 0.75),
              "&:hover": { bgcolor: alpha("#f87171", 0.1), color: "#f87171" },
              transition: "background-color 0.15s, color 0.15s",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 1.5,
                color: "inherit",
                justifyContent: "center",
                "& svg": { fontSize: "1.1rem" },
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Cerrar sesión"
                slotProps={{ primary: { fontSize: "0.85rem", fontWeight: 500 } }}
                sx={{ my: 0 }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  // ── Drawer ─────────────────────────────────────────────────────────────────

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
          bgcolor: bg,
          boxShadow: "6px 0 30px rgba(0,0,0,0.35)",
        },
      }}
    >
      {contenido}
    </Drawer>
  );
};

export default Sidebar;
