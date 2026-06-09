import { lazy, Suspense } from "react";
import { Box, CircularProgress } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { tokenHelper } from "../utilidades/auth/tokenHelper";
import ProfileSection from "./Profile";

const DashboardCiudadano = lazy(() => import("./ciudadano/DashboardCiudadano"));

function useRol(): string {
  const token = tokenHelper.get();
  if (!token) return "";
  try { return jwtDecode<{ nombre_rol: string }>(token).nombre_rol; } catch { return ""; }
}

const TableroPrincipal = () => {
  const rol = useRol();

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
