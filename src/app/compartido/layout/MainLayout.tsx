import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";

import SmallNav from "../nav/SmallNav";
import BasicTable from "../nav/Nav";
import Footer from "../footer/Footer";

export const MainLayout = () => {
  return (
    <Box>
      {/* NAV SUPERIOR */}
      <SmallNav />
      <BasicTable />
      {/* CONTENIDO */}
      <Box>
        <Outlet />
      </Box>

      {/* FOOTER */}
      <Footer />
    </Box>
  );
};