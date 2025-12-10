import React, { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "../app/shared/layout/MainLayout";



const LazyError = lazy(() =>
    import("../app/shared/Error").then(() => ({
        default: require("../app/shared/Error").Error
    }))
);

const LazyWelcome = lazy(() =>
    import("../app/public/pages/Welcome").then(() => ({
        default: require("../app/public/pages/Welcome").Welcome
    }))
);

// Lazy imports (páginas públicas)
const LazySesion = React.lazy(() => import("../app/public/pages/Sesion"));

const LazyProfile = React.lazy(() => import("../app/private/Profile")); // espera default export



export const MainRoute = () => {
    return (
        <Routes>
            {/* Layout principal con menú */}
            <Route path="/" element={<MainLayout />}>
                <Route path="/login" element={<LazySesion />} />
                <Route path="/perfil" element={<LazyProfile />} />
                {/* ruta index */}
                <Route index element={<LazyWelcome />} />
                {/* otras rutas dentro del layout */}
            </Route>
            {/* fallback para rutas no encontradas */}
            <Route path="*" element={<LazyError />} />
        </Routes>
    );
};