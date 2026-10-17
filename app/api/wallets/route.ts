// ==============================================================================
// TataDana: API Route /api/wallets
// Handles wallet listing, creation, setting default wallet, and inter-wallet transfer
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { Wallet } from '@/types/database';
import { toWIBISOString } from '@/lib/date-utils';

export async function GET(request: NextRequest) {
  try {
    const { data: wallets, error } = await supabase
      .from('wallets')
      .select('*')
      .order('is_default', { ascending: false });

    if (error) throw error;

    // Also get transaction counts per wallet
    const { data: transactions } = await supabase.from('transactions').select('id, wallet_id');

    const enrichedWallets = (wallets || []).map((w: Wallet) => ({
      ...w,
      transactionCount: (transactions || []).filter((tx: any) => tx.wallet_id === w.id).length,
    }));

    return NextResponse.json({ data: enrichedWallets });
  } catch (error: any) {
    console.error('Error fetching wallets:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data dompet: ' + (error?.message || 'Internal error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. SET DEFAULT WALLET
    if (action === 'set_default') {
      const { wallet_id, user_id = 'user-dev-tatadana-01' } = body;
      if (!wallet_id) {
        return NextResponse.json({ error: 'wallet_id wajib disertakan' }, { status: 400 });
      }

      // First reset all other wallets default status
      const { data: allWallets } = await supabase.from('wallets').select('*');
      for (const w of allWallets || []) {
        if (w.id === wallet_id) {
          await supabase.from('wallets').update({ is_default: true }).eq('id', w.id);
        } else if (w.is_default) {
          await supabase.from('wallets').update({ is_default: false }).eq('id', w.id);
        }
      }

      return NextResponse.json({ success: true, message: 'Dompet default berhasil diperbarui' });
    }

    // 2. INTER-WALLET TRANSFER
    if (action === 'transfer') {
      const {
        source_wallet_id,
        destination_wallet_id,
        amount,
        description = 'Transfer Antar Dompet',
        transaction_date = toWIBISOString(),
        user_id = 'user-dev-tatadana-01',
      } = body;

      const numAmount = Number(amount);
      if (!source_wallet_id || !destination_wallet_id || !numAmount || numAmount <= 0) {
        return NextResponse.json(
          { error: 'Sumber dompet, tujuan dompet, dan nominal valid wajib diisi' },
          { status: 400 }
        );
      }

      if (source_wallet_id === destination_wallet_id) {
        return NextResponse.json(
          { error: 'Dompet sumber dan dompet tujuan tidak boleh sama' },
          { status: 400 }
        );
      }

      // Fetch source and dest wallets
      const { data: sourceWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', source_wallet_id)
        .single();

      const { data: destWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('id', destination_wallet_id)
        .single();

      if (!sourceWallet || !destWallet) {
        return NextResponse.json({ error: 'Dompet tidak ditemukan' }, { status: 404 });
      }

      if (Number(sourceWallet.balance) < numAmount) {
        return NextResponse.json(
          {
            error: `Saldo tidak mencukupi di ${sourceWallet.name} (Tersedia: Rp ${Number(sourceWallet.balance).toLocaleString('id-ID')})`,
          },
          { status: 400 }
        );
      }

      // Create TRANSFER transaction record
      const { data: tx, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id,
          wallet_id: source_wallet_id,
          destination_wallet_id: destination_wallet_id,
          type: 'TRANSFER',
          amount: numAmount,
          description: description || `Transfer dari ${sourceWallet.name} ke ${destWallet.name}`,
          transaction_date,
          source: 'TRANSFER',
        })
        .select()
        .single();

      if (txError) throw txError;

      // Update balances directly if not automatically triggered
      const newSourceBal = Number(sourceWallet.balance) - numAmount;
      const newDestBal = Number(destWallet.balance) + numAmount;

      await supabase.from('wallets').update({ balance: newSourceBal }).eq('id', source_wallet_id);
      await supabase.from('wallets').update({ balance: newDestBal }).eq('id', destination_wallet_id);

      return NextResponse.json({
        success: true,
        message: `Berhasil mentransfer Rp ${numAmount.toLocaleString('id-ID')} dari ${sourceWallet.name} ke ${destWallet.name}`,
        data: tx,
      });
    }

    // 3. CREATE NEW WALLET
    const {
      name,
      type = 'CASH',
      balance = 0,
      color = '#f97316',
      icon = 'wallet',
      is_default = false,
      user_id = 'user-dev-tatadana-01',
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nama dompet wajib diisi' }, { status: 400 });
    }

    // If marked default, unset others first
    if (is_default) {
      const { data: allWallets } = await supabase.from('wallets').select('*');
      for (const w of allWallets || []) {
        if (w.is_default) {
          await supabase.from('wallets').update({ is_default: false }).eq('id', w.id);
        }
      }
    }

    const { data: newWallet, error: createError } = await supabase
      .from('wallets')
      .insert({
        user_id,
        name,
        type,
        balance: Number(balance),
        color,
        icon,
        is_default: Boolean(is_default),
      })
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({ success: true, data: newWallet }, { status: 201 });
  } catch (error: any) {
    console.error('Error processing wallet action:', error);
    return NextResponse.json(
      { error: 'Gagal memproses dompet: ' + (error?.message || 'Internal error') },
      { status: 500 }
    );
  }
}
