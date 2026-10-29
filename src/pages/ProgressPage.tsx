import React from 'react';
import { ActivePage } from '../types';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { TrendingUp, Award, Calendar, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProgressPageProps {
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const weeklyStudyHours = [
    { day: 'Mon', hours: 3.5 },
    { day: 'Tue', hours: 2.0 },
    { day: 'Wed', hours: 4.2 },
    { day: 'Thu', hours: 3.0 },
    { day: 'Fri', hours: 1.5 },
    { day: 'Sat', hours: 6.0 },
    { day: 'Sun', hours: 5.2 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3498DB] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Academic Performance & Mastery Analytics</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">Learning Progress & Analytics</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Track study hours, diagnostic mock exam percentiles, and competency retention.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Sparkles className="w-4 h-4" />}
          onClick={() => onNavigate('ai-reviewer')}
        >
          Review Weak Topics with AI
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#E1EFF7]">
          <CardBody className="p-6">
            <div className="text-xs font-semibold text-[#64748B] uppercase">Weekly Study Time</div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-[#2C3E50] mt-2">
              25.4 hrs
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">↑ +4.2 hrs vs last week</p>

            {/* Simple weekly bars */}
            <div className="flex items-end justify-between gap-2 pt-6 h-28">
              {weeklyStudyHours.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className="w-full bg-[#3498DB] rounded-t-md transition-all hover:bg-[#2980B9]"
                    style={{ height: `${(d.hours / 6.5) * 100}%` }}
                    title={`${d.hours} hrs on ${d.day}`}
                  />
                  <span className="text-[10px] text-[#64748B] font-mono">{d.day}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="border-[#E1EFF7]">
          <CardBody className="p-6">
            <div className="text-xs font-semibold text-[#64748B] uppercase">Licensure Readiness Index</div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-[#2C3E50] mt-2">
              91.4%
            </div>
            <p className="text-xs text-[#3498DB] font-semibold mt-1">Calculated across 5 Diagnostic Drills</p>
            <div className="mt-4 space-y-2">
              <ProgressBar value={91} showPercent={false} color="bg-emerald-500" />
              <div className="text-[11px] text-[#64748B]">Predicted Board Passing Status: Exceptional (Tier 1)</div>
            </div>
          </CardBody>
        </Card>

        <Card className="border-[#E1EFF7]">
          <CardBody className="p-6">
            <div className="text-xs font-semibold text-[#64748B] uppercase">Mock Exam Scores</div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-[#2C3E50] mt-2">
              89.2%
            </div>
            <p className="text-xs text-[#64748B] mt-1">Simulation 1: 82% · Simulation 2: 86% · Simulation 3: 89%</p>
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('quiz')}
                className="w-full justify-center"
              >
                Launch Simulation 4
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
