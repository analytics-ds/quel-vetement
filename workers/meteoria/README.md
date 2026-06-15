# Worker Meteoria — Quel Vêtement

Tracking des crawlers IA (et override de contenu bot) via Cloudflare Worker.

## Pré-requis avant déploiement
1. Le domaine quel-vetement.fr doit être actif sur le compte Cloudflare (zone créée).
2. Enregistrer le site dans Meteoria et récupérer son token, puis remplacer
   `METEORIA_TOKEN_A_REMPLIR` dans `src/index.js`.
3. Créer `.env` avec `CLOUDFLARE_API_TOKEN=...` (non versionné).

## Déploiement
```
cd workers/meteoria
npx wrangler deploy
```
