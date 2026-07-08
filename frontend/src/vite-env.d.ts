/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL của API backend. Local để trống -> dùng "/api/v1" (mock server).
   *  Production (GitHub Pages) đặt trong .env.production trỏ tới backend Azure. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
