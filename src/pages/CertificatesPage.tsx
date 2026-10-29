import React from 'react';
import { ActivePage } from '../types';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Award, Download, CheckCircle2, Calendar } from 'lucide-react';

interface CertificatesPageProps {
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CertificatesPage: React.FC<CertificatesPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const certs = [
    {
      id: 'cert-1',
      title: 'Thermodynamics & Energy Systems Mastery',
      issuedDate: 'Oct 14, 2026',
      credentialId: 'MH-CERT-2026-9901',
      hours: '30 Accredited Hours',
      status: 'Verified',
    },
    {
      id: 'cert-2',
      title: 'Constitutional Law & Professional Ethics Licensure Review',
      issuedDate: 'Oct 20, 2026',
      credentialId: 'MH-CERT-2026-9902',
      hours: '25 Accredited Hours',
      status: 'Verified',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3498DB] mb-1">
            <Award className="w-4 h-4" />
            <span>Academic Credentials & Course Completion Records</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">Certificates & Badges</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Download your officially verified Meliora Learning Hub completion credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certs.map((c) => (
          <Card key={c.id} className="border-[#D6ECFA]">
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#D6ECFA] flex items-center justify-center text-[#3498DB]">
                  <Award className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {c.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#2C3E50]">{c.title}</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Credential ID: <span className="font-mono text-[#2C3E50]">{c.credentialId}</span></p>
              </div>

              <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#F0F6FA]">
                <span>{c.hours}</span>
                <span>Issued {c.issuedDate}</span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={() => onShowToast('Certificate Download', `Downloading ${c.title} certificate PDF`, 'success')}
                className="w-full justify-center"
              >
                Download Verified PDF
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
