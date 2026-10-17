// ==============================================================================
// TataDana: Impersonation Management Service
// Allows Superadmin to view app as any user with persistent banner and audit logs
// ==============================================================================

import { User } from '@/types/database';
import { adminService } from './admin-service';
import { supabase } from '@/lib/supabase/client';

const IMPERSONATE_STORAGE_KEY = 'tatadana_impersonated_user';
const ORIGINAL_ADMIN_STORAGE_KEY = 'tatadana_original_admin';

export const impersonationManager = {
  /**
   * Check if impersonation mode is currently active
   */
  isImpersonating(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(IMPERSONATE_STORAGE_KEY);
  },

  /**
   * Get current impersonated user object if active
   */
  getImpersonatedUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(IMPERSONATE_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Get original admin who initiated the impersonation
   */
  getOriginalAdmin(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(ORIGINAL_ADMIN_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  /**
   * Start impersonating a target user
   */
  async start(targetUser: User, currentAdmin?: User | null): Promise<void> {
    if (typeof window === 'undefined') return;

    // Save target user & original admin in storage
    localStorage.setItem(IMPERSONATE_STORAGE_KEY, JSON.stringify(targetUser));
    if (currentAdmin) {
      localStorage.setItem(ORIGINAL_ADMIN_STORAGE_KEY, JSON.stringify(currentAdmin));
    }

    // Set cookie for server route handlers
    document.cookie = `tatadana_impersonate_user_id=${targetUser.id}; path=/; max-age=86400; SameSite=Lax`;

    // Record Privacy Audit Log
    try {
      await adminService.logAudit({
        adminId: currentAdmin?.id || 'admin-dev-tatadana-01',
        targetUserId: targetUser.id,
        action: 'IMPERSONATION_START',
        details: {
          targetEmail: targetUser.email,
          targetName: targetUser.full_name,
          adminEmail: currentAdmin?.email || 'admin@tatadana.id',
        },
      });
    } catch (e) {
      console.warn('Could not write audit log for impersonation start:', e);
    }
  },

  /**
   * Exit impersonation mode and return to original admin
   */
  async stop(): Promise<User | null> {
    if (typeof window === 'undefined') return null;

    const impersonated = this.getImpersonatedUser();
    const originalAdmin = this.getOriginalAdmin();

    // Clear impersonation storage and cookie
    localStorage.removeItem(IMPERSONATE_STORAGE_KEY);
    localStorage.removeItem(ORIGINAL_ADMIN_STORAGE_KEY);
    document.cookie = `tatadana_impersonate_user_id=; path=/; max-age=0; SameSite=Lax`;

    // Record Privacy Audit Log
    if (impersonated) {
      try {
        await adminService.logAudit({
          adminId: originalAdmin?.id || 'admin-dev-tatadana-01',
          targetUserId: impersonated.id,
          action: 'IMPERSONATION_END',
          details: {
            targetEmail: impersonated.email,
            adminEmail: originalAdmin?.email || 'admin@tatadana.id',
          },
        });
      } catch (e) {
        console.warn('Could not write audit log for impersonation stop:', e);
      }
    }

    return originalAdmin;
  },
};
