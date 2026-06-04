import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import { useState } from "react";
import Sidebar from "../../compartido/nav/Sidebar";

export const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", flex: 1 }}>
        <Box sx={{ width: "100%", maxWidth: "1400px" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};