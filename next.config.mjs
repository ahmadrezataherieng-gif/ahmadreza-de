import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the site is served as plain files by nginx on our own VPS.
  output: 'export',
  images: { unoptimized: true },
  // nginx serves directory indexes, so emit `/de/index.html` style folders.
  trailingSlash: true,
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
