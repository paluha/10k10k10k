'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function CrmNav() {
  const pathname = usePathname();
  return (
    <nav className="crmNav">
      <span className="crmLogo">
        10K<span>Traffic</span> CRM
      </span>
      <Link href="/crm" className={pathname === '/crm' ? 'active' : ''}>
        Доска
      </Link>
      <Link href="/crm/analytics" className={pathname === '/crm/analytics' ? 'active' : ''}>
        Аналитика
      </Link>
    </nav>
  );
}
