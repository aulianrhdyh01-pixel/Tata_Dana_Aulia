'use client';

// ==============================================================================
// TataDana: Dashboard Root Shell Layout
// Orange + White fintech design (#ffffff / #f8fafc) with orange accents (#f97316)
// Provides Sidebar, Header, dynamic wallet switcher, impersonation banner,
// and global Add Transaction modal.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { AddTransactionModal } from '@/components/dashboard/add-transaction-modal';
import { impersonationManager } from '@/lib/admin/impersonation';
import { ShieldAlert, LogOut, ExternalLink } from 'lucide-react';
import { User } from '@/types/database';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const router = useRouter();

  // Check impersonation on mount and storage events
  useEffect(() => {
    const checkImpersonation = () => {
      const active = impersonationManager.isImpersonating();
      setIsImpersonating(active);
      if (active) {
        setImpersonatedUser(impersonationManager.getImpersonatedUser());
      } else {
        setImpersonatedUser(null);
      }
    };

    checkImpersonation();
    window.addEventListener('storage', checkImpersonation);
    return () => window.removeEventListener('storage', checkImpersonation);
  }, []);

  const handleExitImpersonation = async () => {
    await impersonationManager.stop();
    setIsImpersonating(false);
    setImpersonatedUser(null);
    router.push('/admin/users');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Impersonation Banner Alert */}
      {isImpersonating && (
        <aside
          aria-label="Notifikasi impersonasi"
          className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-black px-4 py-2.5 text-xs font-semibold shadow-md flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-white">
            <ShieldAlert className="w-4 h-4 text-amber-200 shrink-0" />
            <p>
              <span className="font-bold">Mode Impersonasi Aktif:</span> Anda sedang melihat dashboard sebagai{' '}
              <strong className="underline decoration-white underline-offset-2">
                {impersonatedUser?.full_name || impersonatedUser?.email || 'User'}
              </strong>{' '}
              ({impersonatedUser?.email})
            </p>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950 text-white hover:bg-zinc-900 transition-colors shrink-0 text-xs font-bold shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400" />
            <span>Keluar & Kembali ke Admin</span>
          </button>
        </aside>
      )}

      {/* Main Layout Container */}
      <div className="flex flex-1">
        {/* Responsive Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
          {/* Header */}
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onOpenAddTransaction={() => setAddTxOpen(true)}
          />

          {/* Page Body */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>

      {/* Global Add Transaction Modal */}
      <AddTransactionModal
        isOpen={addTxOpen}
        onClose={() => setAddTxOpen(false)}
        onSuccess={() => {
          // Trigger custom event so active dashboard page can reload
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('tatadana:transaction-created'));
          }
        }}
      />
    </div>
  );
}
