'use client';

import { usePathname } from 'next/navigation';

export function AdminHeader() {
  const pathname = usePathname();
  
  // Extract page title from pathname
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 1) {
      const page = segments[segments.length - 1];
      return page
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'Admin';
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-2xl font-semibold">{getPageTitle()}</h1>
      </div>
    </header>
  );
}

