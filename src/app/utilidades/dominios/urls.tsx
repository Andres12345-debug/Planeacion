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

    // ── Workflows (admin) ─────────────────────────────────────────────────────
    WORKFLOWS: "/privado/workflows",
    WORKFLOW: (id: number) => `/privado/workflows/${id}`,
    WORKFLOW_ETAPAS: (wId: number) => `/privado/workflows/${wId}/etapas`,
    WORKFLOW_ETAPA: (wId: number, eId: number) => `/privado/workflows/${wId}/etapas/${eId}`,
    WORKFLOW_PASOS: (wId: number, eId: number) => `/privado/workflows/${wId}/etapas/${eId}/pasos`,
    WORKFLOW_PASO: (pasoId: number) => `/privado/workflows/pasos/${pasoId}`,
}