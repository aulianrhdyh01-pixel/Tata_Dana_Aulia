"""
Frontend Generator for TataDana v2.0
Clean Modern Orange-White Visual Theme
"""

import os
import sys

OUTPUT_FILE = r'C:\Users\ASUS\.gemini\antigravity\scratch\tatadana\index.html'

def get_head_and_topbanner():
    return '''<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TataDana — Catat Keuangan Semudah Chat Langsung dari Telegram</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    * { font-family: 'Plus Jakarta Sans', sans-serif; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f8fafc; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #ea580c; }
    html { scroll-behavior: smooth; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen selection:bg-orange-500 selection:text-white">

  <!-- TOP BAR NOTIFICATION / BANNER -->
  <div id="topBanner" class="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 border-b border-orange-700/20 text-xs px-4 py-1.5 flex items-center justify-between text-white font-medium shadow-sm">
    <div class="flex items-center gap-2">
      <span class="inline-block w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
      <span class="font-bold">TataDana Engine v2.0 (Sistem Riil SQLite Aktif)</span>
      <span class="text-orange-100 hidden sm:inline">| Timezone: <b class="text-white font-mono">WIB (Asia/Jakarta)</b></span>
      <span class="text-orange-100 hidden md:inline">| Database: <b class="text-emerald-200">SQLite Persistent Storage</b></span>
    </div>
    <div class="flex items-center gap-3">
      <span id="liveClock" class="font-mono text-white text-xs">--:--:-- WIB</span>
      <span class="bg-white/20 text-white px-2 py-0.5 rounded text-[11px] font-mono border border-white/30 backdrop-blur-sm">Midtrans Verified</span>
    </div>
  </div>

  <div id="appContainer">
'''

print("Loaded module head")
