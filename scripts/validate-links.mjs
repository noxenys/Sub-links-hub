import axios from 'axios';
import https from 'https';

// 忽略 SSL 证书错误
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// 无效的 HTTP 状态码
const INVALID_STATUS_CODES = [402, 404, 502, 503, 504, 500, 403, 401];

// 订阅链接列表
const subscriptionLinks = [
  {
    id: 1,
    title: 'GitHub 项目 1',
    url: 'https://raw.githubusercontent.com/mermeroo/V2RAY-CLASH-BASE64-Subscription.Links/main/sub.txt',
    source: 'github',
  },
  {
    id: 2,
    title: 'GitHub 项目 2',
    url: 'https://raw.githubusercontent.com/SnapdragonLee/SystemProxy/main/clash.yaml',
    source: 'github',
  },
  {
    id: 3,
    title: 'Rentry 资源',
    url: 'https://rentry.co/clash-sub-links/raw',
    source: 'rentry',
  },
  {
    id: 4,
    title: 'Pastebin 资源',
    url: 'https://pastebin.com/raw/6PpQ4ksn',
    source: 'pastebin',
  },
  {
    id: 5,
    title: 'GitLab 项目',
    url: 'https://gitlab.com/thuhollow2/cn/-/raw/main/sub.txt',
    source: 'gitlab',
  },
  {
    id: 6,
    title: 'GitHub 配置文件',
    url: 'https://raw.githubusercontent.com/zhongfly/clash-config/master/clash.yml',
    source: 'github',
  },
];

/**
 * 验证单个链接
 */
async function validateLink(link) {
  try {
    console.log(`[验证] ${link.title} - ${link.url}`);

    const response = await axios.head(link.url, {
      timeout: 10000,
      httpsAgent,
      maxRedirects: 5,
      validateStatus: () => true, // 接受所有状态码
    });

    const statusCode = response.status;

    // 检查是否是无效状态码
    if (INVALID_STATUS_CODES.includes(statusCode)) {
      console.log(`  ❌ 失败 - HTTP ${statusCode}`);
      return {
        ...link,
        valid: false,
        statusCode,
        reason: `HTTP ${statusCode}`,
      };
    }

    // 2xx 和 3xx 状态码视为成功
    if (statusCode >= 200 && statusCode < 400) {
      console.log(`  ✅ 成功 - HTTP ${statusCode}`);
      return {
        ...link,
        valid: true,
        statusCode,
      };
    }

    // 其他状态码
    console.log(`  ⚠️  警告 - HTTP ${statusCode}`);
    return {
      ...link,
      valid: false,
      statusCode,
      reason: `HTTP ${statusCode}`,
    };
  } catch (error) {
    console.log(`  ❌ 错误 - ${error.message}`);
    return {
      ...link,
      valid: false,
      statusCode: 0,
      reason: error.message,
    };
  }
}

/**
 * 批量验证链接
 */
async function validateAllLinks() {
  console.log('🔍 开始验证订阅链接...\n');

  const results = [];

  for (const link of subscriptionLinks) {
    const result = await validateLink(link);
    results.push(result);

    // 避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * 生成验证报告
 */
function generateReport(results) {
  const validLinks = results.filter(r => r.valid);
  const invalidLinks = results.filter(r => !r.valid);

  console.log('\n\n📊 验证报告\n');
  console.log('='.repeat(60));
  console.log(`总数: ${results.length}`);
  console.log(`✅ 有效: ${validLinks.length}`);
  console.log(`❌ 无效: ${invalidLinks.length}`);
  console.log('='.repeat(60));

  if (validLinks.length > 0) {
    console.log('\n✅ 有效的链接：\n');
    validLinks.forEach((link, index) => {
      console.log(`${index + 1}. ${link.title}`);
      console.log(`   URL: ${link.url}`);
      console.log(`   状态: HTTP ${link.statusCode}\n`);
    });
  }

  if (invalidLinks.length > 0) {
    console.log('\n❌ 无效的链接：\n');
    invalidLinks.forEach((link, index) => {
      console.log(`${index + 1}. ${link.title}`);
      console.log(`   URL: ${link.url}`);
      console.log(`   原因: ${link.reason}\n`);
    });
  }

  return {
    validLinks,
    invalidLinks,
    summary: {
      total: results.length,
      valid: validLinks.length,
      invalid: invalidLinks.length,
      validRate: ((validLinks.length / results.length) * 100).toFixed(2) + '%',
    },
  };
}

/**
 * 导出有效链接为 JSON
 */
function exportValidLinks(validLinks) {
  const exported = validLinks.map(link => ({
    title: link.title,
    url: link.url,
    source: link.source,
    statusCode: link.statusCode,
  }));

  return JSON.stringify(exported, null, 2);
}

/**
 * 主函数
 */
async function main() {
  try {
    const results = await validateAllLinks();
    const report = generateReport(results);

    // 导出有效链接
    const validLinksJson = exportValidLinks(report.validLinks);
    console.log('\n📥 有效链接 JSON：\n');
    console.log(validLinksJson);

    // 保存到文件
    const fs = await import('fs');
    fs.writeFileSync(
      'valid-links.json',
      validLinksJson,
      'utf-8'
    );
    console.log('\n✅ 已保存到 valid-links.json');

    // 返回统计信息
    console.log('\n📈 统计信息：');
    console.log(JSON.stringify(report.summary, null, 2));

  } catch (error) {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  }
}

main();
