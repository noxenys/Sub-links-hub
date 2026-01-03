import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Parse the database URL
const url = new URL(DATABASE_URL);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  port: url.port || 3306,
};

const categories = [
  { name: 'GitHub 极冷门', icon: '⭐', description: '极冷门但活跃的 GitHub 项目' },
  { name: 'Telegram 频道', icon: '📱', description: 'Telegram 公益频道分享' },
  { name: '论坛分享', icon: '💬', description: '技术论坛中的分享链接' },
  { name: 'Warp+ 资源', icon: '🌐', description: 'Cloudflare Warp+ 相关资源' },
];

const links = [
  // GitHub 极冷门项目
  {
    categoryId: 1,
    title: 'SnapdragonLee/SystemProxy',
    description: '活跃度极高，最近1小时前更新。Star 97，Fork 11，使用人数少。',
    url: 'https://raw.githubusercontent.com/SnapdragonLee/SystemProxy/master/dist/clash_config.yaml',
    protocol: 'Clash',
    stability: 'high',
    tags: JSON.stringify(['Clash', '极冷门', '高频更新']),
  },
  {
    categoryId: 1,
    title: 'SnapdragonLee/SystemProxy (Extra)',
    description: '同上项目的扩展配置，包含更多节点。',
    url: 'https://raw.githubusercontent.com/SnapdragonLee/SystemProxy/master/dist/clash_config_extra.yaml',
    protocol: 'Clash',
    stability: 'high',
    tags: JSON.stringify(['Clash', '扩展配置']),
  },
  {
    categoryId: 1,
    title: 'zhongfly/clash-config',
    description: '极简命名，隐藏在 awesome 列表的 fork 中。长期维护的 Clash 配置。',
    url: 'https://raw.githubusercontent.com/zhongfly/clash-config/master/clash.yml',
    protocol: 'Clash',
    stability: 'high',
    tags: JSON.stringify(['Clash', '伪装命名', '长期维护']),
  },
  {
    categoryId: 1,
    title: 'kort0881/vpn-vless-configs-russia',
    description: '伪装成俄罗斯专用，实际包含全球节点。VLESS/VMESS 协议。',
    url: 'https://raw.githubusercontent.com/kort0881/vpn-vless-configs-russia/main/subscriptions/all.txt',
    protocol: 'VLESS/VMESS',
    stability: 'medium',
    tags: JSON.stringify(['VLESS', 'VMESS', '伪装命名']),
  },
  {
    categoryId: 1,
    title: 'mermeroo/V2RAY-CLASH-BASE64',
    description: '汇总了大量低频更新的链接。Star 456，但内容丰富。',
    url: 'https://github.com/mermeroo/V2RAY-CLASH-BASE64-Subscription.Links/blob/main/SUB%20LINKS',
    protocol: 'Mixed',
    stability: 'medium',
    tags: JSON.stringify(['汇总', '多协议']),
  },

  // Telegram 长期公益频道
  {
    categoryId: 2,
    title: 'SSRSUB 代理分享',
    description: '52K 订阅，每日更新多种协议。Telegram 最活跃的公益资源。',
    url: 'https://raw.githubusercontent.com/ssrsub/ssr/master/clash.yaml',
    protocol: 'Clash',
    stability: 'high',
    tags: JSON.stringify(['Telegram', '每日更新', '多协议']),
  },
  {
    categoryId: 2,
    title: 'SSRSUB - V2ray 订阅',
    description: 'SSRSUB 频道的 V2ray 订阅链接。',
    url: 'https://raw.githubusercontent.com/ssrsub/ssr/master/v2ray',
    protocol: 'V2ray',
    stability: 'high',
    tags: JSON.stringify(['V2ray', 'Telegram']),
  },
  {
    categoryId: 2,
    title: 'SSRSUB - SS 订阅',
    description: 'SSRSUB 频道的 Shadowsocks 订阅链接。',
    url: 'https://raw.githubusercontent.com/ssrsub/ssr/master/ss-sub',
    protocol: 'Shadowsocks',
    stability: 'high',
    tags: JSON.stringify(['Shadowsocks', 'Telegram']),
  },
  {
    categoryId: 2,
    title: '几鸡每日公告',
    description: '小圈子自用公益机场，稳定性高。需访问 Telegram 频道获取最新订阅域名。',
    url: 't.me/ngcssnews',
    protocol: 'Mixed',
    stability: 'high',
    tags: JSON.stringify(['小圈子', '稳定性高', '需访问频道']),
  },
  {
    categoryId: 2,
    title: '马铃薯公益通知',
    description: '提供限速但稳定的公益套餐。需访问 Telegram 频道获取订阅。',
    url: 't.me/my_mlshu',
    protocol: 'Mixed',
    stability: 'medium',
    tags: JSON.stringify(['公益套餐', '限速稳定']),
  },

  // 论坛分享
  {
    categoryId: 3,
    title: 'Warp+ 无限制订阅 (Clash)',
    description: '基于 Cloudflare Warp+ 抓取的节点，流量无限制，适合作为保底节点。V2EX 社区分享。',
    url: 'https://subs.zeabur.app/clash',
    protocol: 'Clash',
    stability: 'high',
    tags: JSON.stringify(['Warp+', '无限流量', 'V2EX']),
  },
  {
    categoryId: 3,
    title: 'Warp+ 无限制订阅 (Surge)',
    description: '同上，Surge 格式。',
    url: 'https://subs.zeabur.app/surge',
    protocol: 'Surge',
    stability: 'high',
    tags: JSON.stringify(['Warp+', 'Surge']),
  },
  {
    categoryId: 3,
    title: 'HostLoc 公益机场汇总',
    description: '论坛大佬整理的防失联公益机场列表。需访问 HostLoc 论坛搜索最新列表。',
    url: 'https://hostloc.com/forum.php?mod=forumdisplay&fid=46',
    protocol: 'Mixed',
    stability: 'medium',
    tags: JSON.stringify(['HostLoc', '论坛汇总', '防失联']),
  },

  // Warp 特殊资源
  {
    categoryId: 4,
    title: 'Warp 官方项目',
    description: '直接从 Cloudflare Warp 官方获取的配置。稳定性最高。',
    url: 'https://tofree.zeabur.app',
    protocol: 'Warp+',
    stability: 'high',
    tags: JSON.stringify(['官方', 'Warp+', '最稳定']),
  },
];

async function seedDatabase() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected to database');

    // Clear existing data
    console.log('Clearing existing data...');
    await connection.execute('DELETE FROM subscription_links');
    await connection.execute('DELETE FROM subscription_categories');

    // Insert categories
    console.log('Inserting categories...');
    for (const category of categories) {
      await connection.execute(
        'INSERT INTO subscription_categories (name, icon, description) VALUES (?, ?, ?)',
        [category.name, category.icon, category.description]
      );
    }
    console.log(`✓ Inserted ${categories.length} categories`);

    // Insert links
    console.log('Inserting links...');
    for (const link of links) {
      await connection.execute(
        'INSERT INTO subscription_links (categoryId, title, description, url, protocol, stability, tags, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [link.categoryId, link.title, link.description, link.url, link.protocol, link.stability, link.tags, 1]
      );
    }
    console.log(`✓ Inserted ${links.length} links`);

    console.log('✓ Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
