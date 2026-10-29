import React from 'react';
import { ActivePage, ReviewPackage } from '../types';
import { reviewPackages } from '../data/mockData';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Package, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface PackagesPageProps {
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  packages?: ReviewPackage[];
}

export const PackagesPage: React.FC<PackagesPageProps> = ({
  onNavigate,
  onShowToast,
  packages: propPackages,
}) => {
  const displayPackages = propPackages || reviewPackages;
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Current Active Enrolled Package Banner */}
      <div className="bg-gradient-to-r from-white via-[#F4FAFD] to-[#D6ECFA]/40 p-6 rounded-2xl border border-[#BCE0F7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-[#3498DB] bg-white border border-[#D6ECFA]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Currently Active Subscription</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">
            PRC Licensure Comprehensive Review (Batch Alpha)
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Valid until May 31, 2027 · Includes 68 modules, 5 diagnostic mock exams, and unlimited AI Reviewer digests.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('student-dashboard')}
          >
            Access Dashboard
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => onNavigate('ai-reviewer')}
          >
            AI Reviewer
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#2C3E50] mb-4">
          All Available Meliora Learning Hub Packages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`flex flex-col justify-between ${
                pkg.id === 'pkg-board-comprehensive'
                  ? 'border-[#3498DB] ring-2 ring-[#3498DB]/15'
                  : 'border-[#E1EFF7]'
              }`}
            >
              <CardBody className="p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="text-xs font-semibold text-[#3498DB] uppercase tracking-wide">
                    {pkg.category}
                  </div>
                  <h3 className="text-base font-bold text-[#2C3E50] mt-1 mb-2">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mb-4">{pkg.targetAudience}</p>

                  <div className="py-2.5 border-y border-[#F0F6FA] mb-4">
                    <span className="text-2xl font-bold font-mono tabular-nums text-[#2C3E50]">
                      {pkg.price}
                    </span>
                    <span className="text-xs text-[#64748B]"> / {pkg.period}</span>
                  </div>

                  <div className="space-y-2 mb-6">
                    {(pkg.features || []).map((feat: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#2C3E50]">
                        <Check className="w-3.5 h-3.5 text-[#3498DB] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant={pkg.id === 'pkg-board-comprehensive' ? 'secondary' : 'primary'}
                  size="md"
                  onClick={() => {
                    onShowToast('Package Selected', `Switched review syllabus to ${pkg.title}`, 'success');
                    onNavigate('student-dashboard');
                  }}
                  className="w-full justify-center"
                >
                  {pkg.id === 'pkg-board-comprehensive' ? 'Current Package' : 'Switch to this Program'}
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
