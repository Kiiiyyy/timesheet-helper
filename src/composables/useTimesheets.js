import { ref, computed, watch, onUnmounted, toValue } from 'vue'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { sanitizeTicketNo, buildFormattedText } from '../utils/formatters'

const COLLECTION_NAME = 'timesheets'

export function useTimesheets(selectedDate, enabled = ref(true)) {
  const entries = ref([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref(null)

  let unsubscribe = null

  const totalHours = computed(() => {
    const sum = entries.value.reduce((acc, item) => acc + (Number(item.hours) || 0), 0)
    return Math.round(sum * 100) / 100
  })

  function stopListening() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  function subscribeByDate(dateStr) {
    stopListening()

    if (!dateStr) {
      entries.value = []
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null

    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '==', dateStr)
    )

    unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))

        // Urutkan di sisi client agar tidak butuh composite index Firestore
        docs.sort((a, b) => (a.createdAtMs || 0) - (b.createdAtMs || 0))

        entries.value = docs
        isLoading.value = false
      },
      (err) => {
        console.error('Firestore listener error:', err)
        error.value = err.message || 'Gagal memuat data timesheet.'
        isLoading.value = false
      }
    )
  }

  watch(
    [() => toValue(selectedDate), () => toValue(enabled)],
    ([newDate, isEnabled]) => {
      if (!isEnabled) {
        stopListening()
        entries.value = []
        isLoading.value = false
        error.value = null
        return
      }

      subscribeByDate(newDate)
    },
    { immediate: true }
  )

  onUnmounted(() => {
    stopListening()
  })

  async function addEntry({ hours, ticketNo, title, activity }) {
    isSaving.value = true
    error.value = null

    try {
      const cleanTicket = sanitizeTicketNo(ticketNo)
      const cleanTitle = String(title ?? '').trim()
      const cleanActivity = String(activity ?? '').trim()
      const parsedHours = Number(hours)

      const payload = {
        date: toValue(selectedDate),
        hours: parsedHours,
        ticketNo: cleanTicket,
        title: cleanTitle,
        activity: cleanActivity,
        formattedText: buildFormattedText({
          ticketNo: cleanTicket,
          title: cleanTitle,
          activity: cleanActivity,
        }),
        createdAt: serverTimestamp(),
        createdAtMs: Date.now(),
      }

      await addDoc(collection(db, COLLECTION_NAME), payload)
    } catch (err) {
      console.error('Gagal menambah entri:', err)
      error.value = err.message || 'Gagal menyimpan kegiatan.'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateEntry(id, { hours, ticketNo, title, activity }) {
    isSaving.value = true
    error.value = null

    try {
      const cleanTicket = sanitizeTicketNo(ticketNo)
      const cleanTitle = String(title ?? '').trim()
      const cleanActivity = String(activity ?? '').trim()
      const parsedHours = Number(hours)

      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, {
        hours: parsedHours,
        ticketNo: cleanTicket,
        title: cleanTitle,
        activity: cleanActivity,
        formattedText: buildFormattedText({
          ticketNo: cleanTicket,
          title: cleanTitle,
          activity: cleanActivity,
        }),
      })
    } catch (err) {
      console.error('Gagal memperbarui entri:', err)
      error.value = err.message || 'Gagal memperbarui kegiatan.'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function deleteEntry(id) {
    error.value = null

    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await deleteDoc(docRef)
    } catch (err) {
      console.error('Gagal menghapus entri:', err)
      error.value = err.message || 'Gagal menghapus kegiatan.'
      throw err
    }
  }

  return {
    entries,
    totalHours,
    isLoading,
    isSaving,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
  }
}