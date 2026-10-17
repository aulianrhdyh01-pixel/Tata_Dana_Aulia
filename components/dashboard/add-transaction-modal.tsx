'use client';

// ==============================================================================
// TataDana: Add Transaction Modal Component
// Modern Orange-White Fintech Theme
// Supports Expense, Income, Transfer, Wallet selection, and Multi-Item Receipt details
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Receipt,
  Calendar,
  Wallet as WalletIcon,
  Tag,
} from 'lucide-react';
import { Wallet, Category, TransactionType } from '@/types/database';
import { formatRupiah, toWIBISOString } from '@/lib/date-utils';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialType?: TransactionType;
}

interface ItemForm {
  item_name: string;
  qty: number;
  price: number;
  total: number;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'EXPENSE',
}: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [destWalletId, setDestWalletId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showItems, setShowItems] = useState(false);
  const [items, setItems] = useState<ItemForm[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setType(initialType);
    setErrorMsg(null);

    const loadData = async () => {
      try {
        const [wRes, cRes] = await Promise.all([
          fetch('/api/wallets'),
          fetch('/api/budgets'),
        ]);
        const wJson = await wRes.json();
        const cJson = await cRes.json();

        if (wJson.data) {
          setWallets(wJson.data);
          const defWallet = wJson.data.find((w: Wallet) => w.is_default) || wJson.data[0];
          if (defWallet) setWalletId(defWallet.id);
          if (wJson.data.length > 1) setDestWalletId(wJson.data[1].id);
        }

        if (cJson.categories) {
          setCategories(cJson.categories);
          const firstExpCat = cJson.categories.find((c: Category) => c.type === 'EXPENSE');
          if (firstExpCat) setCategoryId(firstExpCat.id);
        }
      } catch (err) {
        console.error('Error loading wallets & categories:', err);
      }
    };

    loadData();
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) =>
    type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE'
  );

  const addItemRow = () => {
    setItems([...items, { item_name: '', qty: 1, price: 0, total: 0 }]);
  };

  const updateItem = (index: number, field: keyof ItemForm, value: any) => {
    const next = [...items];
    const item = { ...next[index], [field]: value };
    if (field === 'qty' || field === 'price') {
      const q = field === 'qty' ? Number(value) : item.qty;
      const p = field === 'price' ? Number(value) : item.price;
      item.total = q * p;
    }
    next[index] = item;
    setItems(next);

    // Auto update total amount if items are present
    const sum = next.reduce((acc, it) => acc + (it.total || 0), 0);
    if (sum > 0) setAmount(String(sum));
  };

  const removeItemRow = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    const sum = next.reduce((acc, it) => acc + (it.total || 0), 0);
    if (sum > 0) setAmount(String(sum));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Nominal transaksi harus lebih dari 0.');
      return;
    }

    if (!walletId) {
      setErrorMsg('Pilih dompet sumber transaksi.');
      return;
    }

    if (type === 'TRANSFER' && (!destWalletId || destWalletId === walletId)) {
      setErrorMsg('Pilih dompet tujuan yang berbeda.');
      return;
    }

    if (type !== 'TRANSFER' && !categoryId) {
      setErrorMsg('Pilih kategori transaksi.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        wallet_id: walletId,
        destination_wallet_id: type === 'TRANSFER' ? destWalletId : null,
        category_id: type !== 'TRANSFER' ? categoryId : null,
        type,
        amount: numAmount,
        description: description || (type === 'TRANSFER' ? 'Transfer Antar Dompet' : 'Catatan Baru'),
        transaction_date: `${txDate}T12:00:00+07:00`,
        source: 'MANUAL',
        items: showItems ? items.filter((it) => it.item_name.trim() !== '') : [],
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan transaksi');
      }

      // Reset and close
      setAmount('');
      setDescription('');
      setItems([]);
      setShowItems(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg my-8 rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#18181b]">
          <h3 className="text-base font-bold text-zinc-100 tracking-tight">Catat Transaksi Baru</h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#18181b] border border-zinc-800">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => setType('TRANSFER')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'TRANSFER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Nominal Transaksi (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                Rp
              </span>
              <input
                type="number"
                required
                min="100"
                step="100"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-lg font-bold text-zinc-100 bg-[#18181b] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-zinc-500"
              />
            </div>
            {amount && !isNaN(Number(amount)) && (
              <p className="mt-1 text-xs text-orange-400 font-semibold font-mono">
                {formatRupiah(Number(amount))}
              </p>
            )}
          </div>

          {/* Wallet Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                {type === 'TRANSFER' ? 'Dompet Sumber' : 'Pilih Dompet / Rekening'}
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs text-zinc-100 bg-[#18181b] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id} className="bg-[#18181b] text-zinc-100">
                    {w.name} ({formatRupiah(Number(w.balance))})
                  </option>
                ))}
              </select>
            </div>

            {type === 'TRANSFER' ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Dompet Tujuan
                </label>
                <select
                  value={destWalletId}
                  onChange={(e) => setDestWalletId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs text-zinc-100 bg-[#18181b] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} disabled={w.id === walletId} className="bg-[#18181b] text-zinc-100">
                      {w.name} ({formatRupiah(Number(w.balance))})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Kategori</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs text-zinc-100 bg-[#18181b] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
                >
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#18181b] text-zinc-100">
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Tanggal (WIB)</label>
              <input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                className="w-full px-3 py-2.5 text-xs text-zinc-100 bg-[#18181b] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Keterangan / Catatan</label>
              <input
                type="text"
                placeholder="cth: Makan Siang Restoran"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 text-xs text-zinc-100 bg-[#18181b] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Multi-Item Struk Accordion */}
          {type === 'EXPENSE' && (
            <div className="pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!showItems && items.length === 0) {
                      addItemRow();
                    }
                    setShowItems(!showItems);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300"
                >
                  <Receipt className="w-4 h-4" />
                  <span>
                    {showItems ? 'Sembunyikan Rincian Struk' : '+ Tambah Rincian Struk Belanja'}
                  </span>
                </button>

                {showItems && (
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                )}
              </div>

              {showItems && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#18181b] border border-zinc-800"
                    >
                      <input
                        type="text"
                        placeholder="Nama Barang"
                        value={it.item_name}
                        onChange={(e) => updateItem(idx, 'item_name', e.target.value)}
                        className="flex-1 px-2 py-1 text-xs text-zinc-100 bg-[#121215] border border-zinc-700 rounded focus:outline-none focus:border-orange-500 placeholder-zinc-500"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={it.qty}
                        onChange={(e) => updateItem(idx, 'qty', e.target.value)}
                        className="w-12 px-2 py-1 text-xs text-center text-zinc-100 bg-[#121215] border border-zinc-700 rounded focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="number"
                        step="500"
                        placeholder="Harga"
                        value={it.price || ''}
                        onChange={(e) => updateItem(idx, 'price', e.target.value)}
                        className="w-20 px-2 py-1 text-xs text-right text-zinc-100 bg-[#121215] border border-zinc-700 rounded focus:outline-none focus:border-orange-500"
                      />
                      <span className="text-[11px] font-bold text-zinc-300 w-16 text-right truncate font-mono">
                        {formatRupiah(it.total)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1 text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
