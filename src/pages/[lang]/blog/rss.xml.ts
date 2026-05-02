import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export const prerender = true;

export async function GET(context: { site: URL }) {
  const posts = await getCollection('blog');
  const sortedPosts = posts
    .filter(p => !p.id.includes('//')) // security
    .sort((a, b) => new Date(b.data.published_date).valueOf() - new Date(a.data.published_date).valueOf())
    .slice(0, 50); // latest 50

  return rss({
    title: 'PromptCost.org Blog — AI Model Pricing & GPU Rental Guides',
    description: 'Expert analysis on AI API pricing, model comparisons, and GPU rental strategies. Compare 200+ AI models and optimize your API spend.',
    site: context.site,
    items: sortedPosts.map(post => ({
      title: post.data.meta_title || post.data.title,
      description: post.data.meta_description || post.data.description,
      pubDate: new Date(post.data.published_date),
      link: `/en/blog/${post.id.replace(/\.mdx?$/, '')}/`,
      categories: [post.data.category],
      author: post.data.author,
    })),
    customData: `<language>en-us</language>`,
    stylesheet: false,
  });
}
