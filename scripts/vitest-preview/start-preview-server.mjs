#!/usr/bin/env node

// Adapted from vitest-preview
// https://github.com/nvh95/vitest-preview/blob/main/packages/vitest-preview/src/node/previewServer.ts

import fs from 'fs';
import path from 'path';
import express from 'express';
import { createServer as createServer$1 } from 'vite';
import { fileURLToPath } from 'url';
import { openBrowser } from '@vitest-preview/dev-utils';

const CACHE_FOLDER = path.join(process.cwd(), ".vitest-preview");

function createCacheFolderIfNeeded() {
  if (!fs.existsSync(CACHE_FOLDER)) {
    fs.mkdirSync(CACHE_FOLDER, {
      recursive: true
    });
  }
}

const port = process.env.PORT || 5006;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
createCacheFolderIfNeeded();
const emptyHtml = fs.readFileSync(
  path.resolve(__dirname, "empty.html"),
  "utf-8"
);
fs.writeFileSync(path.join(CACHE_FOLDER, "index.html"), emptyHtml);
async function createServer() {
  const app = express();
  const vite = await createServer$1({
    optimizeDeps: {
    },
    server: {
      middlewareMode: true,
    },
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const snapshotHtmlFile = path.join(CACHE_FOLDER, "index.html");
      let template = fs.readFileSync(path.resolve(snapshotHtmlFile), "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
  app.listen(port, () => {
    console.log(`Vitest Preview Server listening on http://localhost:${port}`);
    openBrowser(`http://localhost:${port}`);
  });
}
createServer();
