/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the FastAPI backend, no trailing slash. E.g. https://api.energygrappling.com */
  readonly VITE_API_URL?: string;
  readonly VITE_ENVIRONMENT?: string;
  readonly VITE_ENABLE_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
