import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: Cloudflare Workers serve `out/` as plain static assets.
  output: 'export',
  images: { unoptimized: true },
  // Emit `/amonel/index.html` style folders; wrangler's `auto-trailing-slash` matches.
  trailingSlash: true,
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
