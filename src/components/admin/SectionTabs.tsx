'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Tab {
  name: string;
  href: string;
}

interface SectionTabsProps {
  tabs: Tab[];
  basePath: string;
}

export function SectionTabs({ tabs, basePath }: SectionTabsProps) {
  const pathname = usePathname();

  return (
    <div className="border-b">
      <nav className="flex space-x-8" aria-label="Section navigation">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                'border-b-2 py-4 px-1 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

