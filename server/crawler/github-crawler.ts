import { BaseCrawler, CrawledLink } from './base-crawler';

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
}

interface GitHubFile {
  name: string;
  path: string;
  type: string;
  download_url: string;
}

export class GitHubCrawler extends BaseCrawler {
  private maxStars: number = 100;
  private maxForks: number = 50;
  private keywords: string[] = [
    'subscription',
    'proxy',
    'clash',
    'v2ray',
    'trojan',
    'vless',
    'vmess',
  ];

  constructor(maxStars: number = 100, maxForks: number = 50) {
    super('github', 15000);
    this.maxStars = maxStars;
    this.maxForks = maxForks;
  }

  async crawl(): Promise<CrawledLink[]> {
    const links: CrawledLink[] = [];

    for (const keyword of this.keywords) {
      try {
        const repos = await this.searchRepositories(keyword);

        for (const repo of repos) {
          try {
            const repoLinks = await this.extractLinksFromRepo(repo);
            links.push(...repoLinks);
          } catch (error) {
            console.error(`Failed to extract links from ${repo.full_name}:`, error);
          }
        }

        // 避免 API 限制
        await this.delay(1000);
      } catch (error) {
        console.error(`Failed to search for keyword "${keyword}":`, error);
      }
    }

    return links;
  }

  /**
   * 搜索 GitHub 仓库
   */
  private async searchRepositories(keyword: string): Promise<GitHubRepo[]> {
    try {
      const query = `${keyword} in:readme stars:<${this.maxStars} forks:<${this.maxForks}`;
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=30`;

      const response = await this.fetchWithRetry(url);
      const data = JSON.parse(response);

      return data.items || [];
    } catch (error) {
      console.error(`GitHub search error for keyword "${keyword}":`, error);
      return [];
    }
  }

  /**
   * 从仓库中提取链接
   */
  private async extractLinksFromRepo(repo: GitHubRepo): Promise<CrawledLink[]> {
    const links: CrawledLink[] = [];

    try {
      // 获取 README 文件
      const readmeContent = await this.getReadmeContent(repo.full_name);
      if (readmeContent) {
        const extractedLinks = this.extractLinksFromText(readmeContent);
        links.push(
          ...extractedLinks.map(link => ({
            ...link,
            source: 'github',
            sourceUrl: repo.html_url,
            sourceTitle: repo.full_name,
            tags: [...(repo.topics || []), 'github', 'readme'],
          }))
        );
      }

      // 获取 Release 信息
      const releaseLinks = await this.getLinksFromReleases(repo.full_name);
      links.push(
        ...releaseLinks.map(link => ({
          ...link,
          source: 'github',
          sourceUrl: repo.html_url,
          sourceTitle: repo.full_name,
          tags: ['github', 'release'],
        }))
      );

      // 获取特定文件（如 config.yaml, sub.txt 等）
      const fileLinks = await this.getLinksFromFiles(repo.full_name);
      links.push(
        ...fileLinks.map(link => ({
          ...link,
          source: 'github',
          sourceUrl: repo.html_url,
          sourceTitle: repo.full_name,
          tags: ['github', 'config-file'],
        }))
      );
    } catch (error) {
      console.error(`Error extracting links from ${repo.full_name}:`, error);
    }

    return links;
  }

  /**
   * 获取 README 内容
   */
  private async getReadmeContent(repoFullName: string): Promise<string | null> {
    try {
      const url = `https://api.github.com/repos/${repoFullName}/readme`;
      const response = await this.fetchWithRetry(url);
      const data = JSON.parse(response);

      // 获取原始内容
      const rawUrl = `https://raw.githubusercontent.com/${repoFullName}/main/README.md`;
      const rawContent = await this.fetchWithRetry(rawUrl);
      return rawContent;
    } catch (error) {
      // 尝试其他分支
      try {
        const rawUrl = `https://raw.githubusercontent.com/${repoFullName}/master/README.md`;
        return await this.fetchWithRetry(rawUrl);
      } catch {
        return null;
      }
    }
  }

  /**
   * 从文本中提取链接
   */
  private extractLinksFromText(text: string): CrawledLink[] {
    const links: CrawledLink[] = [];

    // 匹配 URL
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
            title: `GitHub Link - ${this.extractProtocol(normalizedUrl).toUpperCase()}`,
            description: 'Extracted from GitHub repository',
            protocol: this.extractProtocol(normalizedUrl),
            source: 'github',
            tags: ['auto-extracted'],
            stability: 'medium',
          });
        }
      }
    }

    return links;
  }

  /**
   * 从 Release 中获取链接
   */
  private async getLinksFromReleases(repoFullName: string): Promise<CrawledLink[]> {
    const links: CrawledLink[] = [];

    try {
      const url = `https://api.github.com/repos/${repoFullName}/releases?per_page=5`;
      const response = await this.fetchWithRetry(url);
      const releases = JSON.parse(response);

      for (const release of releases) {
        const extractedLinks = this.extractLinksFromText(release.body || '');
        links.push(...extractedLinks);
      }
    } catch (error) {
      console.error(`Error fetching releases for ${repoFullName}:`, error);
    }

    return links;
  }

  /**
   * 从特定文件中获取链接
   */
  private async getLinksFromFiles(repoFullName: string): Promise<CrawledLink[]> {
    const links: CrawledLink[] = [];
    const fileNames = ['sub.txt', 'config.yaml', 'clash.yaml', 'config.json', 'links.txt'];

    for (const fileName of fileNames) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${repoFullName}/main/${fileName}`;
        const content = await this.fetchWithRetry(rawUrl);
        const extractedLinks = this.extractLinksFromText(content);
        links.push(...extractedLinks);
      } catch {
        // 尝试其他分支
        try {
          const rawUrl = `https://raw.githubusercontent.com/${repoFullName}/master/${fileName}`;
          const content = await this.fetchWithRetry(rawUrl);
          const extractedLinks = this.extractLinksFromText(content);
          links.push(...extractedLinks);
        } catch {
          // 文件不存在，继续
        }
      }
    }

    return links;
  }
}
