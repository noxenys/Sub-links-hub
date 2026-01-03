import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { SubscriptionLink } from '@/lib/subscriptionData';

interface LinkCardProps {
  link: SubscriptionLink;
}

export default function LinkCard({ link }: LinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    if (link.url.startsWith('http')) {
      window.open(link.url, '_blank');
    }
  };

  const stabilityColor = {
    high: 'bg-emerald-500/20 text-emerald-300',
    medium: 'bg-yellow-500/20 text-yellow-300',
    low: 'bg-red-500/20 text-red-300',
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
      {/* 背景渐变效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-5 space-y-4">
        {/* 标题和稳定性标签 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-accent transition-colors">
              {link.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {link.description}
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${stabilityColor[link.stability]}`}>
            {link.stability === 'high' && '高稳定'}
            {link.stability === 'medium' && '中等'}
            {link.stability === 'low' && '低稳定'}
          </span>
        </div>

        {/* 协议标签 */}
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 rounded text-xs font-medium bg-secondary text-secondary-foreground">
            {link.protocol}
          </span>
          {link.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* URL 显示 */}
        <div className="bg-secondary/50 rounded p-3 font-mono text-xs text-muted-foreground break-all max-h-12 overflow-hidden">
          {link.url}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleCopy}
            className="flex-1 gap-2 bg-accent hover:bg-accent/90"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制链接
              </>
            )}
          </Button>
          {link.url.startsWith('http') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpen}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              打开
            </Button>
          )}
        </div>

        {/* 更新时间 */}
        {link.lastUpdated && (
          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            最后更新: {link.lastUpdated}
          </p>
        )}
      </div>
    </div>
  );
}
