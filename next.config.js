/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mini.s-shot.ru',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.thum.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.thumbnail.ws',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.screenshotmachine.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'htmlcsstoimage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'webshot.amanoteam.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig
