import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const botanicHomePath = path.join(__dirname, "botanic-html", "botanic_care_coming_soon.html");

/** Dev: serve marketing HTML with zero Vite transforms (exact file bytes). */
function rawMarketingHomeMiddleware() {
  return (
    req: { url?: string; method?: string },
    res: { setHeader: (k: string, v: string) => void; end: (b: string) => void },
    next: () => void
  ) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }
    const pathname = (req.url?.split("?")[0] ?? "") as string;
    if (pathname !== "/" && pathname !== "/index.html") {
      return next();
    }
    try {
      const html = fs.readFileSync(botanicHomePath, "utf-8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(html);
    } catch {
      next();
    }
  };
}

/** Dev/preview: `/` = static marketing `index.html`; every other route serves `app.html` (React SPA). */
function spaFallbackMiddleware() {
  return (req: { url?: string } | undefined, _res: unknown, next: () => void) => {
    const raw = req?.url ?? "";
    const pathname = raw.split("?")[0] ?? "";

    if (
      pathname.startsWith("/@") ||
      pathname.startsWith("/node_modules") ||
      pathname.startsWith("/src/") ||
      pathname.startsWith("/@vite") ||
      pathname.startsWith("/@fs")
    ) {
      return next();
    }

    if (pathname === "/" || pathname === "/index.html") {
      return next();
    }

    if (pathname.includes(".") && !pathname.endsWith("/")) {
      const base = pathname.split("/").pop() ?? "";
      if (base.includes(".")) {
        return next();
      }
    }

    req!.url = "/app.html" + (raw.includes("?") ? "?" + raw.split("?")[1] : "");
    next();
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    port: 8080,
    host: "::",
  },
  plugins: [
    react(),
    {
      name: "spa-fallback-app-html",
      configureServer(server) {
        server.middlewares.use(rawMarketingHomeMiddleware());
        server.middlewares.use(spaFallbackMiddleware());
      },
      configurePreviewServer(server) {
        server.middlewares.use(spaFallbackMiddleware());
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        app: path.resolve(__dirname, "app.html"),
      },
    },
  },
}));
