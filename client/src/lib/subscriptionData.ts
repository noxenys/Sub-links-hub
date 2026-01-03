export interface SubscriptionLink {
  id: string;
  title: string;
  description: string;
  url: string;
  category: 'github' | 'telegram' | 'forum' | 'warp';
  protocol: string;
  lastUpdated?: string;
  stability: 'high' | 'medium' | 'low';
  tags: string[];
}

export const subscriptionLinks: SubscriptionLink[] = [
  // GitHub 极冷门项目
  {
    id: 'github-1',
    title: 'SnapdragonLee/SystemProxy',
    description: '活跃度极高，最近1小时前更新。Star 97，Fork 11，使用人数少。',
    url: 'https://raw.githubusercontent.com/SnapdragonLee/SystemProxy/master/dist/clash_config.yaml',
    category: 'github',
    protocol: 'Clash',
    lastUpdated: '2026-01-03',
    stability: 'high',
    tags: ['Clash', '极冷门', '高频更新'],
  },
  {
    id: 'github-2',
    title: 'SnapdragonLee/SystemProxy (Extra)',
    description: '同上项目的扩展配置，包含更多节点。',
    url: 'https://raw.githubusercontent.com/SnapdragonLee/SystemProxy/master/dist/clash_config_extra.yaml',
    category: 'github',
    protocol: 'Clash',
    lastUpdated: '2026-01-03',
    stability: 'high',
    tags: ['Clash', '扩展配置'],
  },
  {
    id: 'github-3',
    title: 'zhongfly/clash-config',
    description: '极简命名，隐藏在 awesome 列表的 fork 中。长期维护的 Clash 配置。',
    url: 'https://raw.githubusercontent.com/zhongfly/clash-config/master/clash.yml',
    category: 'github',
    protocol: 'Clash',
    stability: 'high',
    tags: ['Clash', '伪装命名', '长期维护'],
  },
  {
    id: 'github-4',
    title: 'kort0881/vpn-vless-configs-russia',
    description: '伪装成俄罗斯专用，实际包含全球节点。VLESS/VMESS 协议。',
    url: 'https://raw.githubusercontent.com/kort0881/vpn-vless-configs-russia/main/subscriptions/all.txt',
    category: 'github',
    protocol: 'VLESS/VMESS',
    stability: 'medium',
    tags: ['VLESS', 'VMESS', '伪装命名'],
  },
  {
    id: 'github-5',
    title: 'mermeroo/V2RAY-CLASH-BASE64',
    description: '汇总了大量低频更新的链接。Star 456，但内容丰富。',
    url: 'https://github.com/mermeroo/V2RAY-CLASH-BASE64-Subscription.Links/blob/main/SUB%20LINKS',
    category: 'github',
    protocol: 'Mixed',
    stability: 'medium',
    tags: ['汇总', '多协议'],
  },

  // Telegram 长期公益频道
  {
    id: 'telegram-1',
    title: 'SSRSUB 代理分享',
    description: '52K 订阅，每日更新多种协议。Telegram 最活跃的公益资源。',
    url: 'https://raw.githubusercontent.com/ssrsub/ssr/master/clash.yaml',
    category: 'telegram',
    protocol: 'Clash',
    lastUpdated: '2026-01-02',
    stability: 'high',
    tags: ['Telegram', '每日更新', '多协议'],
  },
  {
    id: 'telegram-2',
    title: 'SSRSUB - V2ray 订阅',
    description: 'SSRSUB 频道的 V2ray 订阅链接。',
    url: 'https://raw.githubusercontent.com/ssrsub/ssr/master/v2ray',
    category: 'telegram',
    protocol: 'V2ray',
    stability: 'high',
    tags: ['V2ray', 'Telegram'],
  },
  {
    id: 'telegram-3',
    title: 'SSRSUB - SS 订阅',
    description: 'SSRSUB 频道的 Shadowsocks 订阅链接。',
    url: 'https://raw.githubusercontent.com/ssrsub/ssr/master/ss-sub',
    category: 'telegram',
    protocol: 'Shadowsocks',
    stability: 'high',
    tags: ['Shadowsocks', 'Telegram'],
  },
  {
    id: 'telegram-4',
    title: '几鸡每日公告',
    description: '小圈子自用公益机场，稳定性高。需访问 Telegram 频道获取最新订阅域名。',
    url: 't.me/ngcssnews',
    category: 'telegram',
    protocol: 'Mixed',
    stability: 'high',
    tags: ['小圈子', '稳定性高', '需访问频道'],
  },
  {
    id: 'telegram-5',
    title: '马铃薯公益通知',
    description: '提供限速但稳定的公益套餐。需访问 Telegram 频道获取订阅。',
    url: 't.me/my_mlshu',
    category: 'telegram',
    protocol: 'Mixed',
    stability: 'medium',
    tags: ['公益套餐', '限速稳定'],
  },

  // 论坛分享
  {
    id: 'forum-1',
    title: 'Warp+ 无限制订阅 (Clash)',
    description: '基于 Cloudflare Warp+ 抓取的节点，流量无限制，适合作为保底节点。V2EX 社区分享。',
    url: 'https://subs.zeabur.app/clash',
    category: 'forum',
    protocol: 'Clash',
    stability: 'high',
    tags: ['Warp+', '无限流量', 'V2EX'],
  },
  {
    id: 'forum-2',
    title: 'Warp+ 无限制订阅 (Surge)',
    description: '同上，Surge 格式。',
    url: 'https://subs.zeabur.app/surge',
    category: 'forum',
    protocol: 'Surge',
    stability: 'high',
    tags: ['Warp+', 'Surge'],
  },
  {
    id: 'forum-3',
    title: 'HostLoc 公益机场汇总',
    description: '论坛大佬整理的防失联公益机场列表。需访问 HostLoc 论坛搜索最新列表。',
    url: 'https://hostloc.com/forum.php?mod=forumdisplay&fid=46',
    category: 'forum',
    protocol: 'Mixed',
    stability: 'medium',
    tags: ['HostLoc', '论坛汇总', '防失联'],
  },

  // Warp 特殊资源
  {
    id: 'warp-1',
    title: 'Warp 官方项目',
    description: '直接从 Cloudflare Warp 官方获取的配置。稳定性最高。',
    url: 'https://tofree.zeabur.app',
    category: 'warp',
    protocol: 'Warp+',
    stability: 'high',
    tags: ['官方', 'Warp+', '最稳定'],
  },
];

export const categories = [
  { id: 'github', label: 'GitHub 极冷门', icon: '⭐' },
  { id: 'telegram', label: 'Telegram 频道', icon: '📱' },
  { id: 'forum', label: '论坛分享', icon: '💬' },
  { id: 'warp', label: 'Warp+ 资源', icon: '🌐' },
];
