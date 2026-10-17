'use client';

// ==============================================================================
// TataDana: Dynamic Period Filter Component
// Options: Harian, Mingguan, Bulanan, Tahunan, Custom date range
// Modern Orange-White Fintech Theme
// ==============================================================================

import React, { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

export type PeriodType = 'today' | 'week' | 'month' | 'year' | 'custom';

interface PeriodFilterProps {
  currentPeriod: PeriodType;
  startDate?: string;
  endDate?: string;
  onPeriodChange: (period: PeriodType, startDate?: string, endDate?: string) => void;
}

export function PeriodFilter({
  currentPeriod,
  startDate,
  endDate,
  onPeriodChange,
}: PeriodFilterProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStart, setCustomStart] = useState(startDate || new Date().toISOString().slice(0, 10));
  const [customEnd, setCustomEnd] = useState(endDate || new Date().toISOString().slice(0, 10));

  const periods: { id: PeriodType; label: string }[] = [
    { id: 'today', label: 'Harian' },
    { id: 'week', label: 'Mingguan' },
    { id: 'month', label: 'Bulanan' },
    { id: 'year', label: 'Tahunan' },
    { id: 'custom', label: 'Kustom' },
  ];

  const handleSelect = (id: PeriodType) => {
    if (id === 'custom') {
      setShowCustomModal(true);
    } else {
      onPeriodChange(id);
    }
  };

  const applyCustomRange = () => {
    setShowCustomModal(false);
    onPeriodChange('custom', customStart, customEnd);
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#18181b] border border-zinc-800 w-fit">
        {periods.map((p) => {
          const isActive = currentPeriod === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelect(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#27272a] text-orange-400 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#27272a]/60'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Range Picker Dialog */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-orange-400" />
              <h3 className="text-base font-bold text-zinc-100">Pilih Rentang Tanggal</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tanggal Awal
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-zinc-100 bg-[#18181b] border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-zinc-100 bg-[#18181b] border border-zinc-700 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                onClick={applyCustomRange}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md shadow-orange-500/20"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
