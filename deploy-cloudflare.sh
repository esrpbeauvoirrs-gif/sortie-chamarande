#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# 🚀 Script de déploiement Cloudflare Pages
# Usage: ./deploy-cloudflare.sh
# ═══════════════════════════════════════════════════════════════

echo "🔧 Build en cours (version multi-fichiers pour le web)..."

# Build avec la config de déploiement (sans single-file)
npx vite build --config vite.config.deploy.ts

echo "✅ Build terminé !"
echo ""
echo "📦 Fichiers générés dans dist/"
ls -la dist/ 2>/dev/null || echo "(dossier dist/ non trouvé)"
echo ""
echo "─────────────────────────────────────────────"
echo "🚀 Déploiement sur Cloudflare Pages :"
echo ""
echo "  Option 1 — En ligne de commande :"
echo "    npx wrangler pages deploy dist --project-name=livret-chamarande"
echo ""
echo "  Option 2 — Drag & Drop :"
echo "    1. Allez sur https://dash.cloudflare.com → Pages"
echo "    2. Cliquez 'Create a project' → 'Direct Upload'"
echo "    3. Glissez le dossier dist/ entier"
echo ""
echo "  Option 3 — Netlify Drop (encore plus simple) :"
echo "    1. Allez sur https://app.netlify.com/drop"
echo "    2. Glissez le dossier dist/ entier"
echo "    3. C'est en ligne !"
echo "─────────────────────────────────────────────"
