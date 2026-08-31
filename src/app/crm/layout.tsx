import './crm.css';
import { CrmNav } from './CrmNav';

export const metadata = { title: '10K Traffic CRM', robots: { index: false, follow: false } };

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="crmShell">
      <CrmNav />
      <div className="crmBody">{children}</div>
    </div>
  );
}
