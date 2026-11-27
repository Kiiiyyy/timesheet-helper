<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  isToday: {
    type: Boolean,
    default: false,
  },
  userEmail: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'prev', 'next', 'today', 'logout'])

function handleDateChange(event) {
  const value = event.target.value
  if (value) {
    emit('update:modelValue', value)
  }
}
</script>

<template>
  <header class="pb-6 border-b border-slate-800 space-y-4">
    <div
      v-if="userEmail"
      class="flex items-center justify-between gap-3 text-xs"
    >
      <div class="flex items-center gap-2 min-w-0 text-slate-400">
        <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
        <span class="truncate font-mono">{{ userEmail }}</span>
      </div>

      <button
        type="button"
        class="shrink-0 px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 hover:bg-rose-950 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
        @click="emit('logout')"
      >
        Keluar
      </button>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
          PKL Timesheet Helper
        </h1>
        <p class="text-xs text-slate-400 mt-1 font-mono">
          [nomor_tiket] judul_tiket: deskripsi_kegiatan
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            type="button"
            title="Hari sebelumnya"
            aria-label="Hari sebelumnya"
            class="px-2.5 py-1.5 rounded-md text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            @click="emit('prev')"
          >
            ←
          </button>

          <input
            type="date"
            :value="modelValue"
            aria-label="Pilih tanggal"
            class="bg-transparent text-sm font-mono text-slate-100 px-2 py-1 focus:outline-none cursor-pointer"
            @input="handleDateChange"
          />

          <button
            type="button"
            title="Hari berikutnya"
            aria-label="Hari berikutnya"
            class="px-2.5 py-1.5 rounded-md text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            @click="emit('next')"
          >
            →
          </button>
        </div>

        <button
          type="button"
          :disabled="isToday"
          class="px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
          :class="
            isToday
              ? 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-default'
              : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-emerald-500/50 hover:text-emerald-400'
          "
          @click="emit('today')"
        >
          Hari Ini
        </button>
      </div>
    </div>
  </header>
</template>