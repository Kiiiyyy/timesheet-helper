<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import LoginGate from './components/LoginGate.vue'
import DateHeader from './components/DateHeader.vue'
import SummaryBar from './components/SummaryBar.vue'
import EntryForm from './components/EntryForm.vue'
import EntryCard from './components/EntryCard.vue'
import {
  getTodayLocal,
  shiftDateString,
  buildMarkdownList,
  buildHtmlList,
} from './utils/formatters'
import { useAuth } from './composables/useAuth'
import { useTimesheets } from './composables/useTimesheets'

const {
  user,
  isAuthReady,
  isSigningIn,
  authError,
  isAuthorized,
  loginWithGoogle,
  logout,
} = useAuth()

const selectedDate = ref(getTodayLocal())
const isFormOpen = ref(false)
const editingEntry = ref(null)
const isAllCopied = ref(false)

let copyAllTimer = null

const {
  entries,
  totalHours,
  isLoading,
  isSaving,
  error,
  addEntry,
  updateEntry,
  deleteEntry,
} = useTimesheets(selectedDate, isAuthorized)

const isToday = computed(() => selectedDate.value === getTodayLocal())

function clearCopyAllTimer() {
  if (copyAllTimer) {
    clearTimeout(copyAllTimer)
    copyAllTimer = null
  }
}

function resetUiState() {
  isFormOpen.value = false
  editingEntry.value = null
  isAllCopied.value = false
  clearCopyAllTimer()
}

// Tutup form & reset state salin ketika berpindah tanggal
watch(selectedDate, () => {
  resetUiState()
})

// Reset state UI ketika user logout
watch(isAuthorized, (authorized) => {
  if (!authorized) {
    resetUiState()
  }
})

onUnmounted(() => {
  clearCopyAllTimer()
})

function handlePrevDay() {
  selectedDate.value = shiftDateString(selectedDate.value, -1)
}

function handleNextDay() {
  selectedDate.value = shiftDateString(selectedDate.value, 1)
}

function handleGoToday() {
  selectedDate.value = getTodayLocal()
}

function handleToggleAddForm() {
  if (isFormOpen.value && !editingEntry.value) {
    isFormOpen.value = false
    return
  }

  editingEntry.value = null
  isFormOpen.value = true
}

function handleStartEdit(entry) {
  editingEntry.value = entry
  isFormOpen.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleCancelForm() {
  isFormOpen.value = false
  editingEntry.value = null
}

async function handleSubmitForm(payload) {
  try {
    if (editingEntry.value) {
      await updateEntry(editingEntry.value.id, payload)
    } else {
      await addEntry(payload)
    }

    isFormOpen.value = false
    editingEntry.value = null
  } catch {
    // Pesan error sudah dikelola oleh state error di useTimesheets
  }
}

async function handleDeleteEntry(id) {
  try {
    if (editingEntry.value?.id === id) {
      editingEntry.value = null
      isFormOpen.value = false
    }
    await deleteEntry(id)
  } catch {
    // Pesan error sudah dikelola oleh state error di useTimesheets
  }
}

async function handleCopyAll() {
  if (entries.value.length <= 1) return

  const markdownList = buildMarkdownList(entries.value)
  const htmlList = buildHtmlList(entries.value)
  if (!markdownList) return

  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      const clipboardItem = new ClipboardItem({
        'text/plain': new Blob([markdownList], { type: 'text/plain' }),
        'text/html': new Blob([htmlList], { type: 'text/html' }),
      })
      await navigator.clipboard.write([clipboardItem])
    } else {
      await navigator.clipboard.writeText(markdownList)
    }

    isAllCopied.value = true
    clearCopyAllTimer()
    copyAllTimer = setTimeout(() => {
      isAllCopied.value = false
    }, 1500)
  } catch (err) {
    console.error('Gagal menyalin semua teks ke clipboard:', err)
  }
}
</script>

<template>
  <LoginGate
    v-if="!isAuthorized"
    :is-auth-ready="isAuthReady"
    :is-signing-in="isSigningIn"
    :auth-error="authError"
    @login="loginWithGoogle"
  />

  <div
    v-else
    class="min-h-screen bg-slate-950 text-slate-100"
  >
    <main class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <DateHeader
        v-model="selectedDate"
        :is-today="isToday"
        :user-email="user?.email || ''"
        @prev="handlePrevDay"
        @next="handleNextDay"
        @today="handleGoToday"
        @logout="logout"
      />

      <SummaryBar
        :total-entries="entries.length"
        :total-hours="totalHours"
        :is-form-open="isFormOpen"
        :is-all-copied="isAllCopied"
        @add="handleToggleAddForm"
        @copy-all="handleCopyAll"
      />

      <div
        v-if="error"
        class="mb-6 bg-rose-950/60 border border-rose-500/30 text-rose-300 text-sm rounded-xl px-4 py-3"
      >
        Terjadi kesalahan: {{ error }}
      </div>

      <EntryForm
        v-if="isFormOpen"
        :editing-entry="editingEntry"
        :is-saving="isSaving"
        @submit="handleSubmitForm"
        @cancel="handleCancelForm"
      />

      <section aria-label="Daftar kegiatan harian">
        <div
          v-if="isLoading"
          class="space-y-3"
        >
          <div
            v-for="n in 2"
            :key="n"
            class="bg-slate-900/60 border border-slate-800 rounded-xl p-5 animate-pulse space-y-3"
          >
            <div class="h-5 w-16 bg-slate-800 rounded" />
            <div class="h-4 w-3/4 bg-slate-800 rounded" />
          </div>
        </div>

        <div
          v-else-if="entries.length > 0"
          class="space-y-3"
        >
          <EntryCard
            v-for="entry in entries"
            :key="entry.id"
            :entry="entry"
            @edit="handleStartEdit"
            @delete="handleDeleteEntry"
          />
        </div>

        <div
          v-else
          class="border-2 border-dashed border-slate-800 rounded-xl p-8 sm:p-10 text-center space-y-3"
        >
          <p class="text-sm font-medium text-slate-300">
            Belum ada catatan kegiatan pada tanggal ini
          </p>
          <p class="text-xs text-slate-500">
            Catat tiket harianmu agar format timesheet siap salin dalam hitungan detik.
          </p>
          <div class="pt-2">
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              @click="handleToggleAddForm"
            >
              + Tambah Kegiatan Pertama
            </button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>