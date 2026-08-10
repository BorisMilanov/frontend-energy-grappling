/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Origin of the FastAPI backend, no trailing slash. E.g. https://api.energygrappling.com */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
