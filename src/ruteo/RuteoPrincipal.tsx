import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import { MainLayout } from "../app/compartido/layout/MainLayout";
import { DashboardLayout } from "../app/privado/compartido/DashboardLayout";
import { Vigilante } from "../app/seguridad/Vigilate";
import { GuardiaRol } from "../app/seguridad/GuardiaRol";
import RecuperarContrasenia from "../app/publico/componentes/RecuperarContrasenia";
import NuevaContrasenia from "../app/publico/componentes/NuevaContrasenia";
import Registro from "../app/publico/paginas/Registro";

const Login = lazy(() => import("../app/publico/paginas/IniciarSesion"));
const Welcome = lazy(() => import("../app/publico/paginas/Welcome"));
const Dashboard = lazy(() => import("../app/privado/TableroPrincipal"));
const Error = lazy(() => import("../app/compartido/Error"));

// Admin — Workflows
const WorkflowLista = lazy(() => import("../app/privado/admin/workflows/WorkflowLista"));
const WorkflowCrear = lazy(() => import("../app/privado/admin/workflows/WorkflowCrear"));

// Gestión de trámites — admin, supervisor, funcionario, visitante
const DashboardGestionTramites = lazy(() => import("../app/privado/funcionario/DashboardGestionTramites"));

export const RuteoPrincipal = () => {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>

        {/* 🌐 PUBLICO */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />

          {/* REGISTRO */}
          <Route path="/registro" element={<Registro />} />

          {/* 🔐 RECUPERAR PASSWORD */}
          <Route path="/recuperar-password" element={<RecuperarContrasenia />} />

          {/* 🔐 RESET PASSWORD CON TOKEN */}
          <Route path="/restablecer-password/:token" element={<NuevaContrasenia />} />
        </Route>

        {/* 🔐 PRIVADO */}
        <Route
          element={
            <Vigilante>
              <DashboardLayout />
            </Vigilante>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Admin — solo rol "admin" */}
          <Route element={<GuardiaRol rolesPermitidos={["admin"]} />}>
            <Route path="/dashboard/admin/workflows" element={<WorkflowLista />} />
            <Route path="/dashboard/admin/workflows/crear" element={<WorkflowCrear />} />
            <Route path="/dashboard/admin/tramites" element={<DashboardGestionTramites />} />
          </Route>

          {/* Gestión de trámites — funcionario, supervisor, visitante */}
          <Route element={<GuardiaRol rolesPermitidos={["funcionario", "supervisor", "visitante"]} />}>
            <Route path="/dashboard/tramites" element={<DashboardGestionTramites />} />
          </Route>

          <Route path="/dashboard/*" element={<Error />} />
        </Route>

        {/* 🌍 GLOBAL 404 */}
        <Route path="*" element={<Error />} />

      </Routes>
    </Suspense>
  );
};