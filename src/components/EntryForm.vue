<script setup>
import { ref, computed, watch } from 'vue'
import { sanitizeTicketNo, buildFormattedText } from '../utils/formatters'

const props = defineProps({
  editingEntry: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const hours = ref(1)
const ticketNo = ref('')
const title = ref('')
const activity = ref('')

const isEditMode = computed(() => Boolean(props.editingEntry))

const livePreview = computed(() =>
  buildFormattedText({
    ticketNo: ticketNo.value,
    title: title.value,
    activity: activity.value,
  })
)

const isFormValid = computed(() => {
  return (
    Number(hours.value) > 0 &&
    sanitizeTicketNo(ticketNo.value).length > 0 &&
    title.value.trim().length > 0 &&
    activity.value.trim().length > 0
  )
})

watch(
  () => props.editingEntry,
  (entry) => {
    if (entry) {
      hours.value = entry.hours
      ticketNo.value = entry.ticketNo
      title.value = entry.title
      activity.value = entry.activity
    } else {
      hours.value = 1
      ticketNo.value = ''
      title.value = ''
      activity.value = ''
    }
  },
  { immediate: true }
)

function handleSubmit() {
  if (!isFormValid.value || props.isSaving) return

  emit('submit', {
    hours: Number(hours.value),
    ticketNo: ticketNo.value,
    title: title.value,
    activity: activity.value,
  })
}
</script>

<template>
  <form
    class="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 space-y-4"
    @submit.prevent="handleSubmit"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-100">
        {{ isEditMode ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru' }}
      </h2>
      <span
        v-if="isEditMode"
        class="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      >
        Mode Edit
      </span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label for="entry-hours" class="block text-xs font-medium text-slate-400 mb-1.5">
          Durasi (Jam)
        </label>
        <input
          id="entry-hours"
          v-model="hours"
          type="number"
          step="0.5"
          min="0.5"
          required
          placeholder="1.5"
          class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <div class="sm:col-span-2">
        <label for="entry-ticket" class="block text-xs font-medium text-slate-400 mb-1.5">
          Nomor Tiket
        </label>
        <input
          id="entry-ticket"
          v-model="ticketNo"
          type="text"
          required
          placeholder="cth: 47223 atau #47223"
          class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>
    </div>

    <div>
      <label for="entry-title" class="block text-xs font-medium text-slate-400 mb-1.5">
        Judul Tiket
      </label>
      <input
        id="entry-title"
        v-model="title"
        type="text"
        required
        placeholder="cth: Fix Bug Validasi Form"
        class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
      />
    </div>

    <div>
      <label for="entry-activity" class="block text-xs font-medium text-slate-400 mb-1.5">
        Deskripsi Kegiatan
      </label>
      <textarea
        id="entry-activity"
        v-model="activity"
        rows="3"
        required
        placeholder="cth: Memperbaiki state error saat submit form timesheet"
        class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors resize-y"
      />
    </div>

    <div class="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[11px] uppercase tracking-wider font-medium text-slate-500">
          Live Preview
        </span>
        <span
          v-if="livePreview"
          class="text-[11px] text-emerald-400"
        >
          Siap salin
        </span>
      </div>
      <p
        class="font-mono text-sm break-words leading-relaxed"
        :class="livePreview ? 'text-emerald-300' : 'text-slate-600 italic'"
      >
        {{ livePreview || '[nomor_tiket] judul_tiket: deskripsi_kegiatan' }}
      </p>
    </div>

    <div class="flex items-center justify-end gap-2 pt-1">
      <button
        type="button"
        :disabled="isSaving"
        class="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors disabled:opacity-50"
        @click="emit('cancel')"
      >
        Batal
      </button>

      <button
        type="submit"
        :disabled="!isFormValid || isSaving"
        class="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {{
          isSaving
            ? 'Menyimpan...'
            : isEditMode
              ? 'Simpan Perubahan'
              : 'Simpan Kegiatan'
        }}
      </button>
    </div>
  </form>
</template>