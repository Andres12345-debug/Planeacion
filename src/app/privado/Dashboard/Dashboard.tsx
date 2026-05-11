import React from "react";
import {
  Grid, 
  Paper,
  Typography,
  Box,
  Stack,
  Avatar,
  alpha,
  useTheme,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  ConfirmationNumberOutlined as TicketIcon,
  DevicesOutlined as AssetIcon,
  SpeedOutlined as SlaIcon,
  CheckCircleOutlined as ResolvedIcon,
  AddCircleOutline as AddIcon,
  DnsOutlined as ServerIcon,
  LaptopMacOutlined as LaptopIcon,
} from "@mui/icons-material";

const Dashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Datos de activos reales para el inventario
  const activeAssets = [
    { id: "SVR-01", name: "Servidor Principal", type: "Server", status: "Online", user: "Admin IT" },
    { id: "LPT-45", name: "MacBook Pro - Diseño", type: "Laptop", status: "Online", user: "Carlos R." },
    { id: "SVR-02", name: "Backup Database", type: "Server", status: "Warning", user: "Sistema" },
    { id: "LPT-12", name: "Dell Latitude - Ventas", type: "Laptop", status: "Offline", user: "Ana M." },
  ];

  const stats = [
    { label: "Tickets Pendientes", value: "14", icon: <TicketIcon />, color: theme.palette.warning.main },
    { label: "Equipos Activos", value: "152", icon: <AssetIcon />, color: theme.palette.info.main },
    { label: "SLA Global", value: "98%", icon: <SlaIcon />, color: theme.palette.success.main },
    { label: "Resueltos Hoy", value: "7", icon: <ResolvedIcon />, color: theme.palette.secondary.main },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* HEADER DINÁMICO */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={900} color="text.primary">
            Servicio GLPI
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestión de infraestructura en tiempo real.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 3, px: 3, py: 1.2, fontWeight: 700, textTransform: "none" }}
        >
          Nuevo Ticket
        </Button>
      </Stack>

      {/* CARDS DE ESTADÍSTICAS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 5,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: isDark ? alpha(theme.palette.background.paper, 0.6) : "background.paper",
                backdropFilter: isDark ? "blur(10px)" : "none",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: alpha(stat.color, 0.15), color: stat.color, width: 52, height: 52 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800}>{stat.value}</Typography>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase" }}>
                    {stat.label}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* TABLA DE INVENTARIO REAL */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: isDark ? alpha(theme.palette.background.paper, 0.4) : "background.paper",
          overflow: "hidden"
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" fontWeight={700}>Dispositivos en Red</Typography>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: isDark ? alpha(theme.palette.primary.main, 0.05) : theme.palette.grey[50] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Equipo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Responsable</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeAssets.map((asset) => (
                <TableRow key={asset.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{asset.id}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {asset.type === "Server" ? <ServerIcon fontSize="small" /> : <LaptopIcon fontSize="small" />}
                      <Typography variant="body2" fontWeight={500}>{asset.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={asset.status} 
                      size="small"
                      sx={{ 
                        fontWeight: 800,
                        fontSize: "0.65rem",
                        bgcolor: asset.status === "Online" ? alpha("#10b981", 0.1) : asset.status === "Warning" ? alpha("#f59e0b", 0.1) : alpha("#ef4444", 0.1),
                        color: asset.status === "Online" ? "#10b981" : asset.status === "Warning" ? "#f59e0b" : "#ef4444",
                        border: "1px solid currentColor"
                      }} 
                    />
                  </TableCell>
                  <TableCell color="text.secondary">{asset.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;