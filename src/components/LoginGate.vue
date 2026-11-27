<script setup>
defineProps({
  isAuthReady: {
    type: Boolean,
    default: false,
  },
  isSigningIn: {
    type: Boolean,
    default: false,
  },
  authError: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['login'])
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      <div class="space-y-2 text-center">
        <div class="mx-auto w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-5 h-5"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h1 class="text-xl font-bold tracking-tight text-slate-100">
          PKL Timesheet Helper
        </h1>
        <p class="text-xs text-slate-400 font-mono">
          [nomor_tiket] judul_tiket: deskripsi_kegiatan
        </p>
      </div>

      <div
        v-if="!isAuthReady"
        class="py-6 flex flex-col items-center justify-center gap-3 text-slate-400"
      >
        <div class="w-5 h-5 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
        <p class="text-xs">Memeriksa sesi login...</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-if="authError"
          role="alert"
          class="bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs sm:text-sm rounded-xl px-4 py-3 leading-relaxed"
        >
          {{ authError }}
        </div>

        <button
          type="button"
          :disabled="isSigningIn"
          class="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="emit('login')"
        >
          <svg
            v-if="!isSigningIn"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="w-4 h-4 fill-current shrink-0"
            aria-hidden="true"
          >
            <path d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.24-.92 2.29-1.96 3v2.49h3.17c1.86-1.71 2.93-4.23 2.93-7.21 0-.41-.04-.81-.1-1.2h-.13z" />
            <path d="M12.17 22c2.65 0 4.88-.88 6.5-2.38l-3.17-2.49c-.88.59-2 .94-3.33.94-2.56 0-4.73-1.73-5.51-4.05H3.39v2.57A9.83 9.83 0 0 0 12.17 22z" />
            <path d="M6.66 14.02a5.91 5.91 0 0 1 0-3.78V7.67H3.39a9.84 9.84 0 0 0 0 8.92l3.27-2.57z" />
            <path d="M12.17 6.19c1.44 0 2.74.5 3.76 1.47l2.82-2.82C17.04 3.24 14.82 2.26 12.17 2.26A9.83 9.83 0 0 0 3.39 7.67l3.27 2.57c.78-2.32 2.95-4.05 5.51-4.05z" />
          </svg>
          <span
            v-else
            class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
          />
          <span>{{ isSigningIn ? 'Menghubungkan...' : 'Masuk dengan Google' }}</span>
        </button>

        <p class="text-[11px] text-center text-slate-500">
          Akses dibatasi hanya untuk akun pemilik yang terdaftar.
        </p>
      </div>
    </div>
  </div>
</template>