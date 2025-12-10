import { Outlet } from "react-router-dom";
import BasicTable from "../nav/Nav";
import SmallNav from "../nav/SmallNav";
import { Box, Toolbar } from "@mui/material";
import Footer from "../footer/Footer"; // ← IMPORTA EL FOOTER

export const MainLayout = () => {
  return (
    <Box>
      <SmallNav />   {/* Nav superior fijo */}
      <BasicTable /> {/* Segundo AppBar fijo */}
      <Toolbar />    {/* Espaciador */}
      <Outlet />     {/* Contenido de cada página */}
      <Footer />     {/* ← AQUÍ VA EL FOOTER */}
    </Box>
  );
};
