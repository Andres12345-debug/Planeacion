import { Box } from "@mui/material";

// 🔥 Nuevo Sidebar
import { useState } from "react";
import Dashboard from "./Dashboard/Dashboard";
import ProfileSection from "./Profile";
export const TableroPrincipal = () => {

    const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      
      {/* EJEMPLO DATOS */}
      <ProfileSection></ProfileSection>
      

    </Box>
  );
};
export default TableroPrincipal;