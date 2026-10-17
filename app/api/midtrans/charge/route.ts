// ==============================================================================
// TataDana: Midtrans Snap Charge API
// Generates Snap payment tokens for PRO subscription upgrades
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { midtransClient } from '@/lib/midtrans/midtrans-client';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planType = 'MONTHLY', userId, userEmail, userName, phoneNumber } = body;

    let targetUserId = userId;
    let targetEmail = userEmail;
    let targetName = userName;

    // If userId not provided, retrieve from current user in Supabase
    if (!targetUserId) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        targetUserId = authData.user.id;
        targetEmail = targetEmail || authData.user.email;
        targetName = targetName || authData.user.user_metadata?.full_name;
      }
    }

    if (!targetUserId || !targetEmail) {
      return NextResponse.json(
        { error: 'User ID and User Email are required to initiate Midtrans transaction.' },
        { status: 400 }
      );
    }

    const transaction = await midtransClient.createTransaction({
      userId: targetUserId,
      userEmail: targetEmail,
      userName: targetName,
      phoneNumber,
      planType: planType === 'YEARLY' ? 'YEARLY' : 'MONTHLY',
    });

    return NextResponse.json({
      success: true,
      ...transaction,
    });
  } catch (error: any) {
    console.error('Midtrans charge error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create payment transaction' }, { status: 500 });
  }
}
