<script setup>
defineProps({
  totalEntries: {
    type: Number,
    required: true,
  },
  totalHours: {
    type: Number,
    required: true,
  },
  isFormOpen: {
    type: Boolean,
    default: false,
  },
  isAllCopied: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['add', 'copy-all'])
</script>

<template>
  <section class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-5">
    <div class="flex flex-wrap items-center gap-2.5">
      <div class="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2">
        <span class="text-xs text-slate-400">Total Kegiatan</span>
        <span class="text-sm font-semibold text-slate-100">{{ totalEntries }}</span>
      </div>

      <div class="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2">
        <span class="text-xs text-slate-400">Total Durasi</span>
        <span class="text-sm font-semibold text-emerald-400">{{ totalHours }} Jam</span>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        v-if="totalEntries > 1"
        type="button"
        class="flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors"
        :class="
          isAllCopied
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
            : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500/50 hover:text-emerald-400'
        "
        @click="emit('copy-all')"
      >
        {{ isAllCopied ? 'Tersalin!' : 'Salin Semua' }}
      </button>

      <button
        type="button"
        class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="
          isFormOpen
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
        "
        @click="emit('add')"
      >
        {{ isFormOpen ? 'Tutup Form' : '+ Tambah Kegiatan' }}
      </button>
    </div>
  </section>
</template>