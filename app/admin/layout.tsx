import { PageShell } from '@/components/admin/PageShell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageShell>{children}</PageShell>;
}

