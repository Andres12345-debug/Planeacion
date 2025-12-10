import { lazy } from "react";
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

export const MainRoute = () => {
    return (
        <Routes>
            {/* Layout principal con menú */}
            <Route path="/" element={<MainLayout />}>
                {/* ruta index */}
                <Route index element={<LazyWelcome />} />
                {/* otras rutas dentro del layout */}
                {/* <Route path="perfil" element={<LazyPerfil />} /> */}
            </Route>
            {/* fallback para rutas no encontradas */}
            <Route path="*" element={<LazyError />} />
        </Routes>
    );
};