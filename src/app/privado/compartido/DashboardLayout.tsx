import { Outlet } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import { useState } from "react";
import Sidebar from "../../compartido/nav/Sidebar";

const drawerWidth = 240;
const collapsedWidth = 72;

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
            <Box
                sx={{
                    p: 3,
                    display: "flex",
                    justifyContent: "center", // 🔥 centra todo el contenido
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: "1400px", // 🔥 ancho tipo dashboard profesional
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};