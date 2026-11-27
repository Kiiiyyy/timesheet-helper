<script setup>
import { ref, onUnmounted } from 'vue'

const props = defineProps({
  entry: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'delete'])

const isCopied = ref(false)
const isConfirmingDelete = ref(false)

let copyTimer = null
let deleteTimer = null

function clearCopyTimer() {
  if (copyTimer) {
    clearTimeout(copyTimer)
    copyTimer = null
  }
}

function clearDeleteTimer() {
  if (deleteTimer) {
    clearTimeout(deleteTimer)
    deleteTimer = null
  }
}

async function handleCopy() {
  const text = props.entry.formattedText || ''
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
    isCopied.value = true
    clearCopyTimer()
    copyTimer = setTimeout(() => {
      isCopied.value = false
    }, 1500)
  } catch (err) {
    console.error('Gagal menyalin teks ke clipboard:', err)
  }
}

function handleDeleteClick() {
  if (!isConfirmingDelete.value) {
    isConfirmingDelete.value = true
    clearDeleteTimer()
    deleteTimer = setTimeout(() => {
      isConfirmingDelete.value = false
    }, 3000)
    return
  }

  clearDeleteTimer()
  isConfirmingDelete.value = false
  emit('delete', props.entry.id)
}

onUnmounted(() => {
  clearCopyTimer()
  clearDeleteTimer()
})
</script>

<template>
  <article class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition-colors">
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
      <div class="space-y-2.5 min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {{ entry.hours }} Jam
          </span>
        </div>

        <p class="font-mono text-sm text-slate-100 leading-relaxed break-words">
          {{ entry.formattedText }}
        </p>
      </div>

      <div class="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
        <button
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
          :class="
            isCopied
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
              : 'bg-emerald-600/15 text-emerald-300 border-emerald-500/25 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
          "
          @click="handleCopy"
        >
          {{ isCopied ? 'Tersalin!' : 'Salin' }}
        </button>

        <button
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/70 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          @click="emit('edit', entry)"
        >
          Edit
        </button>

        <button
          type="button"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="
            isConfirmingDelete
              ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
              : 'text-slate-400 bg-slate-800/70 hover:bg-rose-950 hover:text-rose-400'
          "
          @click="handleDeleteClick"
        >
          {{ isConfirmingDelete ? 'Yakin Hapus?' : 'Hapus' }}
        </button>
      </div>
    </div>
  </article>
</template>