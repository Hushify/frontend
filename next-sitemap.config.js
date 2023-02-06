/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl:
        `https://${process.env.NEXT_PUBLIC_DOMAIN}` || 'https://hushify.io',
    generateRobotsTxt: true,
    generateIndexSitemap: true,
};
