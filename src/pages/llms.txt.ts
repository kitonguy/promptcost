import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort((a, b) =>
    new Date(b.data.published_date).valueOf() - new Date(a.data.published_date).valueOf()
  );

  const lines: string[] = [
    '# PromptCost.org — AI Token Calculator & GPU Rental Index',
    '',
    '## About PromptCost.org',
    '',
    'PromptCost.org is a free, real-time AI token estimation and global model cost comparison tool. We help developers, businesses, and AI enthusiasts understand and optimize their AI spending by providing transparent pricing data across 200+ AI models from multiple providers.',
    '',
    '## Main Features',
    '',
    '### AI Token Calculator',
    'Calculate the exact cost of your AI API usage in real-time. Support for all major providers including OpenAI, Anthropic, Google Gemini, DeepSeek, Mistral, and hundreds of open-source models.',
    '',
    '### GPU Rental Index',
    'Compare live GPU rental prices across 7 providers: AWS, Lambda Labs, RunPod, Vast.ai, Google Cloud, Azure, and CoreWeave. Data updated nightly.',
    '',
    '## Content Sections',
    '',
    '### AI Model Pricing Guides',
    'Expert analysis and guides on AI API pricing, including:',
    '- GPT-4o, Claude, Gemini cost comparisons',
    '- DeepSeek V3 and R1 analysis',
    '- OpenAI o1/o3 reasoning model costs',
    '- Enterprise AI cost management strategies',
    '',
    '### GPU & Infrastructure',
    'Technical guides for AI infrastructure decisions:',
    '- H100 vs A100 rental comparison',
    '- RTX 4090 local development vs cloud',
    '- Spot instance strategies for AI training',
    '- GPU memory requirements for open-source LLMs',
    '',
    '### AI Optimization',
    'Practical guides to reduce AI costs:',
    '- Prompt compression techniques',
    '- Semantic caching strategies',
    '- Token calculation methodology',
    '- API cost reduction best practices',
    '',
    '## All Blog Posts',
    '',
  ];

  // Add all posts with titles and descriptions
  for (const post of sortedPosts) {
    const slug = post.id.replace(/\.mdx?$/, '');
    const url = `https://promptcost.org/en/blog/${slug}/`;
    const title = post.data.title;
    const desc = post.data.description;
    const cat = post.data.category;
    lines.push(`### ${title}`);
    lines.push(`URL: ${url}`);
    lines.push(`Category: ${cat}`);
    lines.push(`Description: ${desc}`);
    if (post.data.keywords && post.data.keywords.length > 0) {
      lines.push(`Keywords: ${post.data.keywords.join(', ')}`);
    }
    if (post.data.answer_summary) {
      lines.push(`Quick Answer: ${post.data.answer_summary}`);
    }
    lines.push('');
  }

  lines.push('## Related Tools', '');
  lines.push('- [AI Token Calculator](https://promptcost.org/en/) — Real-time cost estimation');
  lines.push('- [GPU Rental Index](https://promptcost.org/en/gpu/) — Live GPU pricing comparison');
  lines.push('- [Blog](https://promptcost.org/en/blog/) — All articles and guides');
  lines.push('');
  lines.push('## Company', '');
  lines.push('PromptCost.org — Transparency in Artificial Intelligence');
  lines.push('');
  lines.push('For questions or feedback: [Contact](https://promptcost.org/en/contact/)');

  const content = lines.join('\n');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
