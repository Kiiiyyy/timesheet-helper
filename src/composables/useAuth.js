import { ref, computed, onUnmounted } from 'vue'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const ALLOWED_UID = (import.meta.env.VITE_ALLOWED_UID || '').trim()

function mapAuthErrorMessage(err) {
  switch (err?.code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null
    case 'auth/popup-blocked':
      return 'Pop-up login diblokir browser. Izinkan pop-up untuk situs ini lalu coba lagi.'
    case 'auth/unauthorized-domain':
      return 'Domain ini belum terdaftar di Firebase Authorized Domains.'
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah saat menghubungi Firebase Auth.'
    default:
      return err?.message || 'Gagal melakukan autentikasi Google.'
  }
}

export function useAuth() {
  const user = ref(null)
  const isAuthReady = ref(false)
  const isSigningIn = ref(false)
  const authError = ref(null)

  const isAuthorized = computed(
    () => Boolean(ALLOWED_UID) && user.value?.uid === ALLOWED_UID
  )

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      user.value = null
      isAuthReady.value = true
      return
    }

    if (ALLOWED_UID && firebaseUser.uid === ALLOWED_UID) {
      user.value = firebaseUser
      authError.value = null
      isAuthReady.value = true
      return
    }

    // Fail-closed: akun tidak cocok atau VITE_ALLOWED_UID belum diatur
    if (import.meta.env.DEV) {
      console.info('[Auth] UID akun Google ini:', firebaseUser.uid)
    }

    authError.value = !ALLOWED_UID
      ? 'VITE_ALLOWED_UID belum diisi di .env.local. Salin UID dari DevTools Console atau Firebase Console → Authentication → Users.'
      : 'Akses ditolak. Akun Google ini tidak terdaftar sebagai pemilik aplikasi.'

    user.value = null

    try {
      await signOut(auth)
    } catch (err) {
      console.error('Gagal melakukan auto-signOut:', err)
    } finally {
      isAuthReady.value = true
    }
  })

  onUnmounted(() => {
    unsubscribe()
  })

  async function loginWithGoogle() {
    if (isSigningIn.value) return

    isSigningIn.value = true
    authError.value = null

    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Google Sign-In error:', err)
      authError.value = mapAuthErrorMessage(err)
    } finally {
      isSigningIn.value = false
    }
  }

  async function logout() {
    authError.value = null

    try {
      await signOut(auth)
    } catch (err) {
      console.error('Gagal logout:', err)
      authError.value = err?.message || 'Gagal keluar dari akun.'
    }
  }

  return {
    user,
    isAuthReady,
    isSigningIn,
    authError,
    isAuthorized,
    loginWithGoogle,
    logout,
  }
}