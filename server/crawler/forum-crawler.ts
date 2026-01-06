import { BaseCrawler, CrawledLink } from './base-crawler';
import * as cheerio from 'cheerio';

export class ForumCrawler extends BaseCrawler {
  private sites: Array<{ name: string; url: string; selector: string }> = [
    {
      name: 'V2EX',
      url: 'https://www.v2ex.com/search?q=subscription+link',
      selector: '.item_title a',
    },
    {
      name: 'HostLoc',
      url: 'https://www.hostloc.com/forum-101-1.html',
      selector: 'h3 a',
    },
  ];

  constructor() {
    super('forum', 15000);
  }

  async crawl(): Promise<CrawledLink[]> {
    const links: CrawledLink[] = [];

    for (const site of this.sites) {
      try {
        const siteLinks = await this.crawlSite(site);
        links.push(...siteLinks);
        await this.delay(2000); // 避免被限制
      } catch (error) {
        console.error(`Failed to crawl ${site.name}:`, error);
      }
    }

    return links;
  }

  /**
   * 爬取单个网站
   */
  private async crawlSite(
    site: { name: string; url: string; selector: string }
  ): Promise<CrawledLink[]> {
    const links: CrawledLink[] = [];

    try {
      const html = await this.fetchWithRetry(site.url);
      const $ = cheerio.load(html);

      // 获取所有链接
      const posts = $(site.selector);

      for (let i = 0; i < Math.min(posts.length, 20); i++) {
        const postUrl = $(posts[i]).attr('href');

        if (postUrl) {
          try {
            const postLinks = await this.extractLinksFromPost(postUrl, site.name);
            links.push(...postLinks);
          } catch (error) {
            console.error(`Failed to extract links from post ${postUrl}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error crawling ${site.name}:`, error);
    }

    return links;
  }

  /**
   * 从论坛帖子中提取链接
   */
  private async extractLinksFromPost(postUrl: string, siteName: string): Promise<CrawledLink[]> {
    const links: CrawledLink[] = [];

    try {
      const html = await this.fetchWithRetry(postUrl);
      const $ = cheerio.load(html);

      // 获取帖子内容
      const content = $('body').text();

      // 提取链接
      const urlRegex = /(https?:\/\/[^\s]+|vmess:\/\/[^\s]+|vless:\/\/[^\s]+|trojan:\/\/[^\s]+|ss:\/\/[^\s]+|ssr:\/\/[^\s]+)/gi;
      const matches = content.match(urlRegex);

      if (matches) {
        const uniqueUrls = new Set(matches);
        const urlArray = Array.from(uniqueUrls);

        for (const url of urlArray) {
          const normalizedUrl = this.normalizeLink(url);

          if (this.isValidSubscriptionLink(normalizedUrl)) {
            links.push({
              url: normalizedUrl,
              title: `${siteName} Forum Link`,
              description: `Extracted from ${siteName} forum post`,
              protocol: this.extractProtocol(normalizedUrl),
              source: 'forum',
              sourceUrl: postUrl,
              sourceTitle: siteName,
              tags: ['forum', siteName.toLowerCase()],
              stability: 'medium',
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error extracting links from ${postUrl}:`, error);
    }

    return links;
  }
}

/**
 * Pastebin 爬虫
 */
export class PastebinCrawler extends BaseCrawler {
  constructor() {
    super('pastebin', 10000);
  }

  async crawl(): Promise<CrawledLink[]> {
    const links: CrawledLink[] = [];

    try {
      // 搜索最近的 Pastebin 链接
      const searchUrl = 'https://pastebin.com/search?q=subscription+link&sort=date';
      const html = await this.fetchWithRetry(searchUrl);
      const $ = cheerio.load(html);

      // 获取搜索结果中的链接
      const results = $('table tr');

      for (let i = 0; i < Math.min(results.length, 10); i++) {
        const resultUrl = $(results[i]).find('a').attr('href') as string | undefined;

        if (resultUrl) {
          try {
            const pasteUrl = `https://pastebin.com${resultUrl}`;
            const pasteContent = await this.fetchWithRetry(pasteUrl);

            const extractedLinks = this.extractLinksFromText(pasteContent);
            links.push(
              ...extractedLinks.map(link => ({
                ...link,
                source: 'pastebin',
                sourceUrl: pasteUrl,
                sourceTitle: 'Pastebin',
                tags: ['pastebin', 'paste'],
              }))
            );
          } catch (error) {
            console.error(`Failed to extract links from Pastebin paste:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error crawling Pastebin:`, error);
    }

    return links;
  }

  /**
   * 从文本中提取链接
   */
  private extractLinksFromText(text: string): CrawledLink[] {
    const links: CrawledLink[] = [];

    const urlRegex = /(https?:\/\/[^\s]+|vmess:\/\/[^\s]+|vless:\/\/[^\s]+|trojan:\/\/[^\s]+|ss:\/\/[^\s]+|ssr:\/\/[^\s]+)/gi;
    const matches = text.match(urlRegex);

    if (matches) {
      const uniqueUrls = new Set(matches);
      const urlArray = Array.from(uniqueUrls);

      for (const url of urlArray) {
        const normalizedUrl = this.normalizeLink(url);

        if (this.isValidSubscriptionLink(normalizedUrl)) {
          links.push({
            url: normalizedUrl,
            title: `Pastebin Link - ${this.extractProtocol(normalizedUrl).toUpperCase()}`,
            description: 'Extracted from Pastebin',
            protocol: this.extractProtocol(normalizedUrl),
            source: 'pastebin',
            tags: ['auto-extracted'],
            stability: 'low',
          });
        }
      }
    }

    return links;
  }
}
