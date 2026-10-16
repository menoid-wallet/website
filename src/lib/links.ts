/* Where the app, the docs and the site live. In production each one is its
   own domain (app.menoid.xyz, docs.menoid.xyz, menoid.xyz). For local
   development, .env.local points them back at paths on this server:
   NEXT_PUBLIC_APP_URL=/app, NEXT_PUBLIC_DOCS_URL=/docs, NEXT_PUBLIC_HOME_URL=/ */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.menoid.xyz";
export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.menoid.xyz";
export const HOME_URL = process.env.NEXT_PUBLIC_HOME_URL || "https://menoid.xyz";
