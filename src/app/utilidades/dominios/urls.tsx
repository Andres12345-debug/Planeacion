export const URLS = {
    //produccion
    //URL_BASE: "https://visionbot-visionweb-backend.t0y4lz.easypanel.host",
    //desarrollo
    URL_BASE: "http://localhost:3550",

    // ── Públicos ──────────────────────────────────────────────────────────────
    INICIAR_SESION: "/publico/auth/login",
    REGISTRO: "/publico/registros/user",
    RECUPERAR_PASSWORD: "/publico/registros/recuperar-password",
    NUEVA_PASSWORD: "/publico/registros/nueva-password",

    // ── Workflows ─────────────────────────────────────────────────────────────
    WORKFLOWS: "/privado/workflows",
    WORKFLOW: (id: number) => `/privado/workflows/${id}`,
    WORKFLOW_ETAPAS: (wId: number) => `/privado/workflows/${wId}/etapas`,
    WORKFLOW_ETAPA: (wId: number, eId: number) => `/privado/workflows/${wId}/etapas/${eId}`,
    WORKFLOW_PASOS: (wId: number, eId: number) => `/privado/workflows/${wId}/etapas/${eId}/pasos`,
    WORKFLOW_PASO: (pasoId: number) => `/privado/workflows/pasos/${pasoId}`,

    // ── Trámites ──────────────────────────────────────────────────────────────
    TRAMITES: "/privado/tramites/todos",
    TRAMITE_DETALLE: (id: number) => `/privado/tramites/${id}/detalle`,
    TRAMITE_TIMELINE: (id: number) => `/privado/tramites/${id}/timeline`,
    INICIAR_TRAMITE: (workflowId: number) => `/privado/tramites/iniciar/${workflowId}`,

    // ── Pasos de trámite ──────────────────────────────────────────────────────
    PASO_SUBSANAR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/subsanar`,
    PASO_REENVIAR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/reenviar`,
    PASO_APROBAR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/aprobar`,
    PASO_DEVOLVER: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/devolver`,
    PASO_ASIGNAR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/asignar`,

    // ── Documentos ────────────────────────────────────────────────────────────
    DOCS_SUBIR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/documentos/subir`,
    DOCS_LISTAR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/documentos`,
}