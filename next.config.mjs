import createNextIntlPlugin from 'next-intl/plugin';

import { ensureLegalAddress } from './scripts/legal-address.mjs';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// Stop here, with a readable message, when the Impressum's address is missing:
// it lives outside the repository (DECISIONS.md 60).
ensureLegalAddress();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: Cloudflare Workers serve `out/` as plain static assets.
  output: 'export',
  images: { unoptimized: true },
  // Emit `/amonel/index.html` style folders; wrangler's `auto-trailing-slash` matches.
  trailingSlash: true,
  reactStrictMode: true,
  // The message formatter (next-intl, use-intl, formatjs: 15 kB gzip) in a chunk
  // of its own. Left to the default splitting it was merged with next/link, which
  // every page needs, so the static pages downloaded and evaluated it for nothing.
  // Only the journey and the desktop shell use it (queue 3c).
  webpack(config, { isServer }) {
    const groups = config.optimization?.splitChunks?.cacheGroups;
    if (!isServer && groups) {
      groups.intl = {
        test: /[\\/]node_modules[\\/](next-intl|use-intl|intl-messageformat|@formatjs)[\\/]/,
        name: 'intl',
        chunks: 'all',
        priority: 60,
        enforce: true,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
