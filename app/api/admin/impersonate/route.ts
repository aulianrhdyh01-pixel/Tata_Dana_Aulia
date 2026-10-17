// ==============================================================================
// TataDana: Impersonation API Endpoint
// Enables Superadmin to switch user contexts safely with audit logging
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { adminService } from '@/lib/admin/admin-service';

export async function GET(req: NextRequest) {
  const impersonateCookie = req.cookies.get('tatadana_impersonate_user_id')?.value;

  if (!impersonateCookie) {
    return NextResponse.json({ isImpersonating: false, user: null });
  }

  const { data: user } = await supabase.from('users').select('*').eq('id', impersonateCookie).maybeSingle();

  return NextResponse.json({
    isImpersonating: !!user,
    user: user || null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, adminId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Target userId is required.' }, { status: 400 });
    }

    // Verify target user exists
    const { data: targetUser } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
    }

    // Record audit log
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await adminService.logAudit({
      adminId: adminId || 'admin-dev-tatadana-01',
      targetUserId: targetUser.id,
      action: 'IMPERSONATION_START',
      details: {
        targetEmail: targetUser.email,
        targetName: targetUser.full_name,
        userAgent: req.headers.get('user-agent'),
      },
      ipAddress: clientIp,
    });

    const response = NextResponse.json({
      success: true,
      message: `Berhasil mengaktifkan mode impersonasi untuk ${targetUser.email}`,
      user: targetUser,
    });

    // Set cookie for browser session
    response.cookies.set('tatadana_impersonate_user_id', targetUser.id, {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    console.error('Impersonation error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const impersonateCookie = req.cookies.get('tatadana_impersonate_user_id')?.value;
    const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

    if (impersonateCookie) {
      await adminService.logAudit({
        adminId: 'admin-dev-tatadana-01',
        targetUserId: impersonateCookie,
        action: 'IMPERSONATION_STOP',
        details: { reason: 'Admin exited impersonation banner' },
        ipAddress: clientIp,
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Mode impersonasi telah dinonaktifkan',
    });

    response.cookies.delete('tatadana_impersonate_user_id');
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
