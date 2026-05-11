import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Collapse,
  IconButton,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import {
  Dashboard,
  People,
  Settings,
  ExpandLess,
  ExpandMore,
  Logout,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;
const collapsedWidth = 72;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  collapsed,
  setCollapsed,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const navigate = useNavigate();
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isActive = (path: string) =>
    location.pathname.startsWith(path);

  const cerrarSesion = () => {
    localStorage.removeItem("TOKEN_AUTORIZACION");
    navigate("/");
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) onClose(); // 🔥 clave para evitar overlay oscuro
  };

  const menu = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/dashboard",
    },
    {
      text: "Usuarios",
      icon: <People />,
      children: [
        { text: "Listar", path: "/usuarios" },
        { text: "Crear", path: "/usuarios/crear" },
      ],
    },
    {
      text: "Configuración",
      icon: <Settings />,
      children: [
        { text: "General", path: "/configuracion" },
        { text: "Roles", path: "/configuracion/roles" },
      ],
    },
  ];

  const drawerContent = (
    <>
      {/* HEADER */}
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: collapsed ? "center" : "space-between",
          px: 1,
          color: theme.palette.secondary.main,
        }}
      >
        {!collapsed && <strong>VUCI</strong>}

        <IconButton onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Toolbar>

      <Divider />

      {/* MENU */}
      <List>
        {menu.map((item) => {
          const hasChildren = !!item.children;

          return (
            <Box key={item.text}>
              <Tooltip title={collapsed ? item.text : ""} placement="right">
                <ListItemButton

                  onClick={() => {
                    if (hasChildren) {
                      toggleMenu(item.text);
                    } else if (item.path) {
                      handleNavigate(item.path);
                    }
                  }}
                  selected={item.path ? isActive(item.path) : false}
                  sx={{
                    justifyContent: collapsed ? "center" : "initial",
                    px: 2,
                    color: theme.palette.sidebar.contrastText, //  texto + iconos

                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: "center",
                          color: theme.palette.sidebar.contrastText, 

                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!collapsed && <ListItemText primary={item.text} />}

                  {!collapsed &&
                    hasChildren &&
                    (openMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </Tooltip>

              {/* SUBMENU */}
              {!collapsed && hasChildren && (
                <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children!.map((sub) => (
                      <ListItemButton
                        key={sub.text}
                        sx={{ pl: 4 ,     color: theme.palette.sidebar.contrastText, // 🔥 texto + iconos
}}
                        selected={isActive(sub.path)}
                        onClick={() => handleNavigate(sub.path)}
                      >
                        <ListItemText primary={sub.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>

      <Divider />

      {/* LOGOUT */}
      <List>
        <Tooltip title={collapsed ? "Cerrar sesión" : ""} placement="right">
          <ListItemButton
            onClick={cerrarSesion}
            sx={{ justifyContent: collapsed ? "center" : "initial" }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: "center",
              }}
            >
              <Logout />
            </ListItemIcon>

            {!collapsed && <ListItemText primary="Cerrar sesión" />}
          </ListItemButton>
        </Tooltip>
      </List>
    </>
  );

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? open : true}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: collapsed ? collapsedWidth : drawerWidth,
          transition: "width 0.3s ease",
          overflowX: "hidden",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          // 🔥 AQUÍ el fondo
          backgroundColor: theme.palette.sidebar.main
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;