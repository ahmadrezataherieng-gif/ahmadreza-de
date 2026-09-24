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
};

export default withNextIntl(nextConfig);
