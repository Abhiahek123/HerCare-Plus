export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/privacy/', '/consent/'],
    },
    sitemap: 'https://hercare.vercel.app/sitemap.xml',
  };
}
