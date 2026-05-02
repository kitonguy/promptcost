import { getCollection } from 'astro:content';

export const prerender = true;

export async function GET() {
  const siteUrl = 'https://promptcost.org';
  const blogPosts = await getCollection('blog');

  const staticPages = [
    { url: siteUrl + '/en/', lastmod: new Date().toISOString().split('T')[0], priority: '1.0', changefreq: 'daily' },
    { url: siteUrl + '/en/blog/', lastmod: new Date().toISOString().split('T')[0], priority: '0.9', changefreq: 'weekly' },
    { url: siteUrl + '/en/gpu/', lastmod: new Date().toISOString().split('T')[0], priority: '0.8', changefreq: 'weekly' },
  ];

  const blogPages = blogPosts.map(post => {
    const slug = post.id.replace(/\.mdx?$/, '');
    const imageUrl = `${siteUrl}/images/${slug}.svg`;
    return {
      url: `${siteUrl}/en/blog/${slug}/`,
      lastmod: (post.data.updated_date || post.data.published_date).split('T')[0],
      priority: '0.8',
      changefreq: 'monthly',
      image: imageUrl
    };
  });

  const allPages = [...staticPages, ...blogPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.image ? `
    <image:image>
      <image:loc>${page.image}</image:loc>
    </image:image>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
