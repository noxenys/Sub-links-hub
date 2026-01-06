import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

// 忽略 SSL 证书错误
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// 链接正则表达式
const LINK_PATTERNS = {
  vmess: /vmess:\/\/[A-Za-z0-9+/=\-_]+/g,
  vless: /vless:\/\/[A-Za-z0-9+/=\-_:@.]+/g,
  trojan: /trojan:\/\/[A-Za-z0-9+/=\-_:@.]+/g,
  ss: /ss:\/\/[A-Za-z0-9+/=\-_:@.]+/g,
  ssr: /ssr:\/\/[A-Za-z0-9+/=\-_:@.]+/g,
  http: /(https?:\/\/[^\s<>"{}|\\^`\[\]]*\.(?:txt|yaml|yml|json|conf))/g,
};

/**
 * Telegram 频道爬虫
 */
async function crawlTelegram() {
  console.log('\n📱 [Telegram] 开始爬取...');

  const channels = [
    'SSRSUB',
    'FreeSSRCloud',
    'ProxySub',
    'ClashSub',
    'V2raySub',
    'TrojanSub',
    'VlessSub',
    'freenode',
    'freevpnnet',
  ];

  const links = [];

  for (const channel of channels) {
    try {
      const url = `https://t.me/s/${channel}`;
      console.log(`  抓取频道: ${channel}`);

      const response = await axios.get(url, {
        timeout: 15000,
        httpsAgent,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const html = response.data;

      // 提取所有链接
      for (const [type, pattern] of Object.entries(LINK_PATTERNS)) {
        const matches = html.match(pattern) || [];
        for (const url of matches) {
          const trimmedUrl = url.trim();
          if (trimmedUrl.length > 10 && trimmedUrl.length < 5000) {
            links.push({
              url: trimmedUrl,
              source: 'telegram',
              channel,
              type,
            });
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ❌ 错误: ${error.message}`);
    }
  }

  // 去重
  const uniqueLinks = Array.from(
    new Map(links.map(link => [link.url, link])).values()
  );
  console.log(`  ✅ 找到 ${uniqueLinks.length} 个链接`);
  return uniqueLinks;
}

/**
 * V2EX 论坛爬虫
 */
async function crawlV2EX() {
  console.log('\n💬 [V2EX] 开始爬取...');

  const links = [];
  const keywords = ['proxy', 'vpn', 'clash', 'v2ray', 'subscription', 'trojan'];

  for (const keyword of keywords) {
    try {
      const url = `https://www.v2ex.com/search?q=${encodeURIComponent(keyword)}`;
      console.log(`  搜索关键词: ${keyword}`);

      const response = await axios.get(url, {
        timeout: 15000,
        httpsAgent,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);

      // 提取帖子内容
      $('div.cell').each((index, element) => {
        const text = $(element).text();

        // 提取链接
        for (const [type, pattern] of Object.entries(LINK_PATTERNS)) {
          const matches = text.match(pattern) || [];
          for (const url of matches) {
            const trimmedUrl = url.trim();
            if (trimmedUrl.length > 10 && trimmedUrl.length < 5000) {
              links.push({
                url: trimmedUrl,
                source: 'v2ex',
                keyword,
                type,
              });
            }
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error(`  ❌ 错误: ${error.message}`);
    }
  }

  // 去重
  const uniqueLinks = Array.from(
    new Map(links.map(link => [link.url, link])).values()
  );
  console.log(`  ✅ 找到 ${uniqueLinks.length} 个链接`);
  return uniqueLinks;
}

/**
 * HostLoc 论坛爬虫
 */
async function crawlHostLoc() {
  console.log('\n🌐 [HostLoc] 开始爬取...');

  const links = [];

  try {
    // HostLoc 免费资源板块
    const url = 'https://www.hostloc.com/forum-134-1.html';
    console.log('  抓取免费资源板块...');

    const response = await axios.get(url, {
      timeout: 15000,
      httpsAgent,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // 提取帖子
    $('tbody tr').each((index, element) => {
      const text = $(element).text();

      // 提取链接
      for (const [type, pattern] of Object.entries(LINK_PATTERNS)) {
        const matches = text.match(pattern) || [];
        for (const url of matches) {
          const trimmedUrl = url.trim();
          if (trimmedUrl.length > 10 && trimmedUrl.length < 5000) {
            links.push({
              url: trimmedUrl,
              source: 'hostloc',
              type,
            });
          }
        }
      }
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error(`  ❌ 错误: ${error.message}`);
  }

  // 去重
  const uniqueLinks = Array.from(
    new Map(links.map(link => [link.url, link])).values()
  );
  console.log(`  ✅ 找到 ${uniqueLinks.length} 个链接`);
  return uniqueLinks;
}

/**
 * Pastebin 爬虫
 */
async function crawlPastebin() {
  console.log('\n📝 [Pastebin] 开始爬取...');

  const links = [];
  const searchTerms = ['clash', 'v2ray', 'trojan', 'vless', 'vmess'];

  for (const term of searchTerms) {
    try {
      const url = `https://pastebin.com/search?q=${encodeURIComponent(term)}`;
      console.log(`  搜索: ${term}`);

      const response = await axios.get(url, {
        timeout: 15000,
        httpsAgent,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);

      // 提取粘贴内容
      $('div.search-result').each((index, element) => {
        const text = $(element).text();

        // 提取链接
        for (const [type, pattern] of Object.entries(LINK_PATTERNS)) {
          const matches = text.match(pattern) || [];
          for (const url of matches) {
            const trimmedUrl = url.trim();
            if (trimmedUrl.length > 10 && trimmedUrl.length < 5000) {
              links.push({
                url: trimmedUrl,
                source: 'pastebin',
                searchTerm: term,
                type,
              });
            }
          }
        }
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ❌ 错误: ${error.message}`);
    }
  }

  // 去重
  const uniqueLinks = Array.from(
    new Map(links.map(link => [link.url, link])).values()
  );
  console.log(`  ✅ 找到 ${uniqueLinks.length} 个链接`);
  return uniqueLinks;
}

/**
 * Rentry 爬虫
 */
async function crawlRentry() {
  console.log('\n📄 [Rentry] 开始爬取...');

  const links = [];
  const pages = ['clash-sub-links', 'proxy-links', 'v2ray-config'];

  for (const page of pages) {
    try {
      const url = `https://rentry.co/${page}/raw`;
      console.log(`  抓取页面: ${page}`);

      const response = await axios.get(url, {
        timeout: 15000,
        httpsAgent,
      });

      const text = response.data;

      // 提取链接
      for (const [type, pattern] of Object.entries(LINK_PATTERNS)) {
        const matches = text.match(pattern) || [];
        for (const url of matches) {
          const trimmedUrl = url.trim();
          if (trimmedUrl.length > 10 && trimmedUrl.length < 5000) {
            links.push({
              url: trimmedUrl,
              source: 'rentry',
              page,
              type,
            });
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`  ❌ 错误: ${error.message}`);
    }
  }

  // 去重
  const uniqueLinks = Array.from(
    new Map(links.map(link => [link.url, link])).values()
  );
  console.log(`  ✅ 找到 ${uniqueLinks.length} 个链接`);
  return uniqueLinks;
}

/**
 * 验证链接可用性
 */
async function validateLinks(links) {
  console.log('\n🔍 验证链接可用性...');

  const validated = [];
  let validCount = 0;

  for (const link of links) {
    try {
      const response = await axios.head(link.url, {
        timeout: 10000,
        httpsAgent,
        maxRedirects: 3,
        validateStatus: () => true,
      });

      const statusCode = response.status;

      // 接受 2xx 和 3xx 状态码
      if (statusCode >= 200 && statusCode < 400) {
        validated.push({
          ...link,
          statusCode,
          valid: true,
        });
        validCount++;
      }
    } catch (error) {
      // 链接无效，跳过
    }
  }

  console.log(`  ✅ 验证完成: ${validCount}/${links.length} 链接有效`);
  return validated;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始多平台爬虫...\n');

  try {
    // 并行爬取所有平台
    const [telegramLinks, v2exLinks, hostlocLinks, pastebinLinks, rentryLinks] =
      await Promise.all([
        crawlTelegram(),
        crawlV2EX(),
        crawlHostLoc(),
        crawlPastebin(),
        crawlRentry(),
      ]);

    // 合并所有链接
    const allLinks = [
      ...telegramLinks,
      ...v2exLinks,
      ...hostlocLinks,
      ...pastebinLinks,
      ...rentryLinks,
    ];

    console.log(`\n📊 总共找到 ${allLinks.length} 个链接`);

    // 去重
    const uniqueLinks = Array.from(
      new Map(allLinks.map(link => [link.url, link])).values()
    );
    console.log(`📊 去重后: ${uniqueLinks.length} 个链接`);

    // 验证链接
    const validatedLinks = await validateLinks(uniqueLinks);

    // 生成报告
    console.log('\n📈 爬虫报告:');
    console.log('='.repeat(60));
    console.log(`总找到: ${allLinks.length}`);
    console.log(`去重后: ${uniqueLinks.length}`);
    console.log(`有效链接: ${validatedLinks.length}`);
    console.log('='.repeat(60));

    // 按来源统计
    const bySource = {};
    for (const link of validatedLinks) {
      bySource[link.source] = (bySource[link.source] || 0) + 1;
    }

    console.log('\n按来源统计:');
    for (const [source, count] of Object.entries(bySource)) {
      console.log(`  ${source}: ${count}`);
    }

    // 保存结果
    const fs = await import('fs');
    const output = {
      timestamp: new Date().toISOString(),
      totalFound: allLinks.length,
      afterDedup: uniqueLinks.length,
      validLinks: validatedLinks.length,
      bySource,
      links: validatedLinks,
    };

    fs.writeFileSync(
      'crawler-results.json',
      JSON.stringify(output, null, 2),
      'utf-8'
    );

    console.log('\n✅ 结果已保存到 crawler-results.json');
  } catch (error) {
    console.error('❌ 爬虫失败:', error);
    process.exit(1);
  }
}

main();
