import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { MainLayout } from "../app/compartido/layout/MainLayout";
import { DashboardLayout } from "../app/privado/compartido/DashboardLayout";
import RecuperarContrasenia from "../app/publico/componentes/RecuperarContrasenia";
import NuevaContrasenia from "../app/publico/componentes/NuevaContrasenia";

// Lazy
const Login = lazy(() => import("../app/publico/paginas/IniciarSesion"));
const Welcome = lazy(() => import("../app/publico/paginas/Welcome"));
const Dashboard = lazy(() => import("../app/privado/TableroPrincipal"));
const Error = lazy(() => import("../app/compartido/Error"));

// 🔐 Guard básico
const PrivateRoute = ({ children }: any) => {
  const token = localStorage.getItem("TOKEN_AUTORIZACION");
  return token ? children : <Navigate to="/login" replace />;
};

export const RuteoPrincipal = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>

        {/* 🌐 PUBLICO */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />

          {/* 🔐 RECUPERAR PASSWORD */}
          <Route path="/recuperar-password" element={<RecuperarContrasenia />} />

          {/* 🔐 RESET PASSWORD CON TOKEN */}
          <Route path="/restablecer-password/:token" element={<NuevaContrasenia />} />
        </Route>

        {/* 🔐 PRIVADO */}
        <Route
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/*" element={<Error />} />
        </Route>

        {/* 🌍 GLOBAL 404 */}
        <Route path="*" element={<Error />} />

      </Routes>
    </Suspense>
  );
};