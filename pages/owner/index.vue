<script setup lang="ts">
definePageMeta({ middleware: 'auth', roles: ['owner'] })
useHead({ title: 'Owner Dashboard — Heyfit' })

const kpis = [
  { label: 'Revenue (bln)', value: 'Rp 412jt', delta: '+18%', trend: 'up' },
  { label: 'Member Aktif', value: '5.184', delta: '+12%', trend: 'up' },
  { label: 'Profit Margin', value: '34%', delta: '+2pp', trend: 'up' },
  { label: 'NPS Score', value: '68', delta: '-3', trend: 'down' },
]

const revenueBars = [42, 55, 48, 70, 65, 82, 90, 78, 95, 88, 100, 92]
const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

const cabang = [
  { kota: 'Jakarta', member: 2840, occ: 82, color: 'bg-brand-400' },
  { kota: 'Bandung', member: 1420, occ: 71, color: 'bg-sky-400' },
  { kota: 'Surabaya', member: 924, occ: 64, color: 'bg-rose-400' },
]
</script>

<template>
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <p class="chip-accent mb-3"><span class="glow-dot" />Owner View</p>
        <h1 class="font-display text-3xl sm:text-4xl font-extrabold text-white">Bisnis Anda dalam satu layar</h1>
        <p class="text-slate-400 mt-1">Ringkasan operasional & finansial real-time.</p>
      </div>
      <div class="flex gap-2">
        <button class="btn-ghost">Bulan ini</button>
        <button class="btn-primary">Download Laporan</button>
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="k in kpis" :key="k.label" class="card p-5 relative overflow-hidden">
        <div v-if="k.label === 'Revenue (bln)'" class="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-brand-400/20 blur-2xl" />
        <p class="text-xs uppercase tracking-widest text-slate-500 relative">{{ k.label }}</p>
        <p class="font-display text-3xl font-extrabold text-white mt-2 relative">{{ k.value }}</p>
        <p
          :class="[
            'mt-1 text-xs font-medium inline-flex items-center gap-1 relative',
            k.trend === 'up' ? 'text-brand-300' : 'text-rose-400',
          ]"
        >
          <span>{{ k.trend === 'up' ? '▲' : '▼' }}</span>
          {{ k.delta }} vs bulan lalu
        </p>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <!-- revenue chart -->
      <div class="lg:col-span-2 card p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="font-display text-lg font-bold text-white">Revenue 12 Bulan Terakhir</h2>
            <p class="text-xs text-slate-500 mt-0.5">Dalam jutaan rupiah</p>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="chip-accent">Revenue</span>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-2 h-48 items-end">
          <div v-for="(v, i) in revenueBars" :key="i" class="flex flex-col items-center gap-1 group">
            <div class="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition">{{ v }}</div>
            <div
              class="w-full rounded-md bg-gradient-to-t from-brand-700/60 to-brand-400 hover:from-brand-600 hover:to-brand-300 transition-all"
              :style="{ height: `${v}%` }"
            />
            <div class="text-[10px] text-slate-500">{{ months[i] }}</div>
          </div>
        </div>
      </div>

      <!-- branch breakdown -->
      <div class="card p-6">
        <h2 class="font-display text-lg font-bold text-white mb-4">Performa Cabang</h2>
        <div class="space-y-5">
          <div v-for="c in cabang" :key="c.kota">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span :class="['h-2 w-2 rounded-full', c.color]" />
                <span class="text-sm font-medium text-white">{{ c.kota }}</span>
              </div>
              <span class="text-xs text-slate-400">{{ c.member.toLocaleString('id-ID') }} member</span>
            </div>
            <div class="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div :class="['h-full rounded-full', c.color]" :style="{ width: `${c.occ}%` }" />
            </div>
            <p class="text-[11px] text-slate-500 mt-1">Occupancy {{ c.occ }}%</p>
          </div>
        </div>

        <div class="mt-6 rounded-xl bg-brand-400/5 border border-brand-400/20 p-4">
          <p class="text-xs uppercase tracking-widest text-brand-300 mb-1">Insight</p>
          <p class="text-sm text-slate-300">Cabang Jakarta memimpin dengan margin 34%. Pertimbangkan ekspansi ke Tangerang Q4.</p>
        </div>
      </div>
    </div>
  </section>
</template>
