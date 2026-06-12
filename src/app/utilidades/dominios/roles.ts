// Etiqueta y color por rol (RoleNames del backend: admin, supervisor, funcionario, ciudadano, visitante).

export const ROL_CONFIG: Record<string, { label: string; color: string }> = {
  admin:       { label: "Administrador", color: "#f59e0b" },
  supervisor:  { label: "Supervisor",    color: "#14b8a6" },
  funcionario: { label: "Funcionario",   color: "#3b82f6" },
  ciudadano:   { label: "Ciudadano",     color: "#8b5cf6" },
  visitante:   { label: "Visitante",     color: "#64748b" },
};

// Roles que pueden configurarse como responsables de una etapa (selects de
// "Funcionario Responsable" al crear/editar workflows).
// Debe coincidir con ROLES_RESPONSABLES_ETAPA en workflows.service.ts (backend).
export const ROLES_RESPONSABLES_ETAPA = ["supervisor", "funcionario"] as const;

// Roles a los que un supervisor puede asignar la ejecución de un paso ya en
// curso (no incluye "supervisor": un supervisor asigna trabajo, no se asigna
// a sí mismo la ejecución).
export const ROLES_EJECUTORES_PASO = ["funcionario"] as const;
