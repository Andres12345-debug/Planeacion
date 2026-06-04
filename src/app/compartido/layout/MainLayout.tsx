import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

import SmallNav from "../nav/SmallNav";
import TopNavigation from "../nav/Nav";
import Footer from "../footer/Footer";

export const MainLayout = () => {
  return (
    <Box>
      <SmallNav />
      <TopNavigation />
      <Box>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};