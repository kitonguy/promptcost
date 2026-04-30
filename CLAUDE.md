# PromptCost.org — Project Rules

## URL Structure

### Trailing Slash (KRITIK)
**Tüm URL'ler trailing slash ile bitmeli (`/`).**

- Neden: Google crawl ederken tutarsızlık yapıyordu — `/blog/post` ve `/blog/post/` ayrı URL olarak görülüyordu ve sayfalar indexlenmiyordu.
- Çözüm: `astro.config.mjs`'de `trailingSlash: "always"` ve sitemap'de tüm URL'ler trailing slash ile.

### Language Prefix
**URL'ler `/en/` prefix ile başlar.**

```
/en/                      → Home page
/en/blog/                 → Blog index
/en/blog/post-slug/        → Blog post
/en/gpu/                  → GPU pricing page
```

- Sebep: Temiz SEO yapısı, gelecekte ek dil eklemesi kolay
- Hreflang: x-default → `/en/`

## Build & Deploy

```bash
npm run build
```

Deploy: Cloudflare Pages veya git push.

## New Post Template

Yeni blog post eklerken:
1. `src/content/blog/` klasörüne `.mdx` dosyası ekle
2. Frontmatter'da `featured_image_url` ve `faq` section ekle
3. `npm run build` çalıştır
