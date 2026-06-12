import { lazy, Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useUsuarioToken } from "../utilidades/auth/usuarioToken";
import ProfileSection from "./Profile";

const DashboardCiudadano = lazy(() => import("./ciudadano/DashboardCiudadano"));

const TableroPrincipal = () => {
  const usuario = useUsuarioToken();
  const rol = usuario?.nombre_rol ?? "";

  if (rol === "ciudadano") {
    return (
      <Suspense fallback={<Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}><CircularProgress /></Box>}>
        <DashboardCiudadano />
      </Suspense>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <ProfileSection />
    </Box>
  );
};

export default TableroPrincipal;
