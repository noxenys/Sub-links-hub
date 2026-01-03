INSERT INTO subscription_categories (name, icon, description) VALUES
('GitHub 极冷门', '⭐', '极冷门但活跃的 GitHub 项目'),
('Telegram 频道', '📱', 'Telegram 公益频道分享'),
('论坛分享', '💬', '技术论坛中的分享链接'),
('Warp+ 资源', '🌐', 'Cloudflare Warp+ 相关资源');

INSERT INTO subscription_links (categoryId, title, description, url, protocol, stability, tags, isActive) VALUES
(1, 'SnapdragonLee/SystemProxy', '活跃度极高，最近1小时前更新。Star 97，Fork 11，使用人数少。', 'https://raw.githubusercontent.com/SnapdragonLee/SystemProxy/master/dist/clash_config.yaml', 'Clash', 'high', '["Clash", "极冷门", "高频更新"]', 1),
(1, 'SnapdragonLee/SystemProxy (Extra)', '同上项目的扩展配置，包含更多节点。', 'https://raw.githubusercontent.com/SnapdragonLee/SystemProxy/master/dist/clash_config_extra.yaml', 'Clash', 'high', '["Clash", "扩展配置"]', 1),
(1, 'zhongfly/clash-config', '极简命名，隐藏在 awesome 列表的 fork 中。长期维护的 Clash 配置。', 'https://raw.githubusercontent.com/zhongfly/clash-config/master/clash.yml', 'Clash', 'high', '["Clash", "伪装命名", "长期维护"]', 1),
(1, 'kort0881/vpn-vless-configs-russia', '伪装成俄罗斯专用，实际包含全球节点。VLESS/VMESS 协议。', 'https://raw.githubusercontent.com/kort0881/vpn-vless-configs-russia/main/subscriptions/all.txt', 'VLESS/VMESS', 'medium', '["VLESS", "VMESS", "伪装命名"]', 1),
(1, 'mermeroo/V2RAY-CLASH-BASE64', '汇总了大量低频更新的链接。Star 456，但内容丰富。', 'https://github.com/mermeroo/V2RAY-CLASH-BASE64-Subscription.Links/blob/main/SUB%20LINKS', 'Mixed', 'medium', '["汇总", "多协议"]', 1),
(2, 'SSRSUB 代理分享', '52K 订阅，每日更新多种协议。Telegram 最活跃的公益资源。', 'https://raw.githubusercontent.com/ssrsub/ssr/master/clash.yaml', 'Clash', 'high', '["Telegram", "每日更新", "多协议"]', 1),
(2, 'SSRSUB - V2ray 订阅', 'SSRSUB 频道的 V2ray 订阅链接。', 'https://raw.githubusercontent.com/ssrsub/ssr/master/v2ray', 'V2ray', 'high', '["V2ray", "Telegram"]', 1),
(2, 'SSRSUB - SS 订阅', 'SSRSUB 频道的 Shadowsocks 订阅链接。', 'https://raw.githubusercontent.com/ssrsub/ssr/master/ss-sub', 'Shadowsocks', 'high', '["Shadowsocks", "Telegram"]', 1),
(2, '几鸡每日公告', '小圈子自用公益机场，稳定性高。需访问 Telegram 频道获取最新订阅域名。', 't.me/ngcssnews', 'Mixed', 'high', '["小圈子", "稳定性高", "需访问频道"]', 1),
(2, '马铃薯公益通知', '提供限速但稳定的公益套餐。需访问 Telegram 频道获取订阅。', 't.me/my_mlshu', 'Mixed', 'medium', '["公益套餐", "限速稳定"]', 1),
(3, 'Warp+ 无限制订阅 (Clash)', '基于 Cloudflare Warp+ 抓取的节点，流量无限制，适合作为保底节点。V2EX 社区分享。', 'https://subs.zeabur.app/clash', 'Clash', 'high', '["Warp+", "无限流量", "V2EX"]', 1),
(3, 'Warp+ 无限制订阅 (Surge)', '同上，Surge 格式。', 'https://subs.zeabur.app/surge', 'Surge', 'high', '["Warp+", "Surge"]', 1),
(3, 'HostLoc 公益机场汇总', '论坛大佬整理的防失联公益机场列表。需访问 HostLoc 论坛搜索最新列表。', 'https://hostloc.com/forum.php?mod=forumdisplay&fid=46', 'Mixed', 'medium', '["HostLoc", "论坛汇总", "防失联"]', 1),
(4, 'Warp 官方项目', '直接从 Cloudflare Warp 官方获取的配置。稳定性最高。', 'https://tofree.zeabur.app', 'Warp+', 'high', '["官方", "Warp+", "最稳定"]', 1);
