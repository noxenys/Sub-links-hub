import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LinkCard from '@/components/LinkCard';
import { Search, Github, Zap, Loader } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // 从数据库获取分类和链接
  const { data: categories = [], isLoading: categoriesLoading } = trpc.subscriptions.categories.useQuery();
  const { data: allLinks = [], isLoading: linksLoading } = trpc.subscriptions.links.useQuery();

  // 设置默认分类
  const defaultCategoryId = useMemo(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(String(categories[0].id));
      return categories[0].id;
    }
    return activeCategory ? parseInt(activeCategory) : null;
  }, [categories, activeCategory]);

  // 过滤链接
  const filteredLinks = useMemo(() => {
    return allLinks.filter((link) => {
      const matchCategory = !activeCategory || link.categoryId === parseInt(activeCategory);
      const tags = typeof link.tags === 'string' ? JSON.parse(link.tags) : link.tags;
      const matchSearch =
        searchQuery === '' ||
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tags.some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchCategory && matchSearch;
    });
  }, [allLinks, activeCategory, searchQuery]);

  // 统计信息
  const stats = useMemo(() => {
    const highStabilityCount = allLinks.filter(l => l.stability === 'high').length;
    const protocolSet = new Set(allLinks.map(l => l.protocol));
    return {
      total: allLinks.length,
      highStability: highStabilityCount,
      protocols: protocolSet.size,
      categories: categories.length,
    };
  }, [allLinks, categories]);

  if (categoriesLoading || linksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(/images/hero-bg.jpg)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />

        <div className="relative container py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">隐秘订阅链接导航</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            SubLinks Hub
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            精选极冷门但活跃的 GitHub 项目、Telegram 公益频道和论坛分享的代理订阅链接。
            <br />
            一键复制，即插即用。
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              className="gap-2 bg-accent hover:bg-accent/90"
              size="lg"
              onClick={() => window.open('https://github.com', '_blank')}
            >
              <Github className="w-5 h-5" />
              查看源代码
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* 搜索和分类 */}
        <div className="space-y-6 mb-12">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="搜索链接、协议、标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-secondary border-border"
            />
          </div>

          {/* 分类按钮 */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === String(category.id) ? 'default' : 'outline'}
                onClick={() => setActiveCategory(String(category.id))}
                className={`gap-2 ${
                  activeCategory === String(category.id)
                    ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                    : ''
                }`}
              >
                <span>{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* 链接网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={{
                  id: String(link.id),
                  title: link.title,
                  description: link.description,
                  url: link.url,
                  category: 'github',
                  protocol: link.protocol,
                  stability: link.stability as 'high' | 'medium' | 'low',
                  tags: typeof link.tags === 'string' ? JSON.parse(link.tags) : link.tags,
                }}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                未找到匹配的链接
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                尝试调整搜索条件或选择其他分类
              </p>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-accent">
                {stats.total}
              </div>
              <p className="text-sm text-muted-foreground mt-2">总链接数</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">
                {stats.highStability}
              </div>
              <p className="text-sm text-muted-foreground mt-2">高稳定性</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">
                {stats.protocols}
              </div>
              <p className="text-sm text-muted-foreground mt-2">协议类型</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">
                {stats.categories}
              </div>
              <p className="text-sm text-muted-foreground mt-2">资源分类</p>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-16 pt-12 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-8">使用指南</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold">
                1
              </div>
              <h3 className="font-semibold text-foreground">选择分类</h3>
              <p className="text-sm text-muted-foreground">
                从 GitHub、Telegram、论坛等不同来源选择订阅链接。
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold">
                2
              </div>
              <h3 className="font-semibold text-foreground">一键复制</h3>
              <p className="text-sm text-muted-foreground">
                点击"复制链接"按钮，立即复制到剪贴板。
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold">
                3
              </div>
              <h3 className="font-semibold text-foreground">导入使用</h3>
              <p className="text-sm text-muted-foreground">
                粘贴到 Clash、Surge 或其他代理工具中即可使用。
              </p>
            </div>
          </div>
        </div>

        {/* 免责声明 */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="bg-secondary/50 rounded-lg p-6 border border-border">
            <h3 className="font-semibold text-foreground mb-3">⚠️ 免责声明</h3>
            <p className="text-sm text-muted-foreground">
              本网站仅为订阅链接导航工具，所有链接均来自公开渠道。使用这些链接产生的任何后果由用户自行承担。
              请遵守当地法律法规，理性使用。
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>SubLinks Hub © 2026. 隐秘订阅链接导航平台。</p>
          <p className="mt-2">
            最后更新: {new Date().toLocaleDateString('zh-CN')}
          </p>
        </div>
      </footer>
    </div>
  );
}
