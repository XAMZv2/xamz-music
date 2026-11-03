# Musik App (Netlify + youtubei.js)

Struktur:
- public/index.html            -> tampilan web
- netlify/functions/search.js  -> GET /api/search?q=...
- netlify/functions/stream.js  -> GET /api/stream?id=...
- netlify.toml, package.json

Jalankan lokal:
  npm install
  npx netlify-cli dev

Deploy:
  Push ke GitHub lalu hubungkan ke Netlify, atau jalankan `npx netlify-cli deploy --prod`.
