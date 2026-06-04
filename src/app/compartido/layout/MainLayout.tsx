import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

import SmallNav from "../nav/SmallNav";
import TopNavigation from "../nav/Nav";
import Footer from "../footer/Footer";

// SmallNav ocupa 48px fijos.
// TopNavigation ocupa 56px en móvil y 64px en sm+.
// El contenido debe empezar debajo de la suma de ambas barras.
const SMALL_NAV_H = 48;

export const MainLayout = () => {
  return (
    <Box>
      <SmallNav />
      <TopNavigation />

      {/* Espaciador: SmallNav (48px) + TopNavigation (56px xs / 64px sm+) */}
      <Box sx={{ height: { xs: SMALL_NAV_H + 56, sm: SMALL_NAV_H + 64 } }} />

      <Box>
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
};