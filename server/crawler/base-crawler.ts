import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

export interface CrawledLink {
  url: string;
  title: string;
  description: string;
  protocol: string;
  source: string;
  sourceUrl?: string;
  sourceTitle?: string;
  tags: string[];
  stability: 'high' | 'medium' | 'low';
}

export interface CrawlerResult {
  source: string;
  totalFound: number;
  newAdded: number;
  updated: number;
  failed: number;
  errors: string[];
  links: CrawledLink[];
  executionTime: number;
}

export abstract class BaseCrawler {
  protected source: string;
  protected client: AxiosInstance;
  protected timeout: number = 10000;
  protected maxRetries: number = 3;
  protected links: CrawledLink[] = [];

  constructor(source: string, timeout: number = 10000) {
    this.source = source;
    this.timeout = timeout;

    this.client = axios.create({
      timeout: this.timeout,
      headers: {
        'User-Agent': this.getRandomUserAgent(),
      },
    });
  }

  /**
   * 获取随机 User-Agent
   */
  protected getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  /**
   * 带重试的 HTTP 请求
   */
  protected async fetchWithRetry(url: string, retries: number = this.maxRetries): Promise<string> {
    try {
      const response = await this.client.get(url);
      return response.data;
    } catch (error) {
      if (retries > 0) {
        await this.delay(1000);
        return this.fetchWithRetry(url, retries - 1);
      }
      throw error;
    }
  }

  /**
   * 延迟函数
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 计算字符串哈希
   */
  protected hashString(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  /**
   * 验证 URL 格式
   */
  protected isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证订阅链接格式
   */
  protected isValidSubscriptionLink(url: string): boolean {
    // 检查是否包含常见的代理协议
    const protocols = ['vmess://', 'vless://', 'trojan://', 'ss://', 'ssr://', 'http://', 'https://'];
    return protocols.some(protocol => url.toLowerCase().startsWith(protocol));
  }

  /**
   * 提取链接中的协议类型
   */
  protected extractProtocol(url: string): string {
    const match = url.match(/^([a-z]+):\/\//i);
    return match ? match[1].toLowerCase() : 'unknown';
  }

  /**
   * 规范化链接（移除空格、特殊字符等）
   */
  protected normalizeLink(url: string): string {
    return url.trim().replace(/\s+/g, '');
  }

  /**
   * 抽象方法：执行爬虫
   */
  abstract crawl(): Promise<CrawledLink[]>;

  /**
   * 执行爬虫并返回结果
   */
  async execute(): Promise<CrawlerResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      this.links = await this.crawl();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);
      console.error(`[${this.source}] Crawler error:`, errorMessage);
    }

    const executionTime = Date.now() - startTime;

    return {
      source: this.source,
      totalFound: this.links.length,
      newAdded: 0, // 将由调用者更新
      updated: 0, // 将由调用者更新
      failed: errors.length > 0 ? 1 : 0,
      errors,
      links: this.links,
      executionTime,
    };
  }

  /**
   * 获取爬虫的链接
   */
  getLinks(): CrawledLink[] {
    return this.links;
  }

  /**
   * 清空链接
   */
  clearLinks(): void {
    this.links = [];
  }
}
