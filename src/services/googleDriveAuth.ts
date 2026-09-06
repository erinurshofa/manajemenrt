import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
const DEFAULT_FIREBASE_CONFIG = {
  projectId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || 'resolute-impact-7xctm',
  appId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || '',
  apiKey: (typeof import.meta !== 'undefined' && (import.meta.env?.GOOGLE_API_KEY || import.meta.env?.VITE_GOOGLE_API_KEY)) || '',
  authDomain: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || 'resolute-impact-7xctm.firebaseapp.com',
  storageBucket: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || 'resolute-impact-7xctm.firebasestorage.app',
  messagingSenderId: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || '',
  measurementId: '',
  oAuthClientId: (typeof import.meta !== 'undefined' && (import.meta.env?.GOOGLE_CLIENT_ID || import.meta.env?.VITE_GOOGLE_CLIENT_ID)) || '',
  recaptchaSiteKey: '',
};

// Lazy Firebase Auth initialization
let authInstance: ReturnType<typeof getAuth> | null = null;

export const getFirebaseAuth = () => {
  if (!authInstance) {
    const customApiKey = (typeof import.meta !== 'undefined' && (import.meta.env?.GOOGLE_API_KEY || import.meta.env?.VITE_GOOGLE_API_KEY)) || '';
    const customClientId = (typeof import.meta !== 'undefined' && (import.meta.env?.GOOGLE_CLIENT_ID || import.meta.env?.VITE_GOOGLE_CLIENT_ID)) || '';

    const effectiveConfig = {
      ...DEFAULT_FIREBASE_CONFIG,
      apiKey: customApiKey || DEFAULT_FIREBASE_CONFIG.apiKey,
      oAuthClientId: customClientId || DEFAULT_FIREBASE_CONFIG.oAuthClientId,
    };

    const app = getApps().length === 0 ? initializeApp(effectiveConfig) : getApp();
    authInstance = getAuth(app);
  }
  return authInstance;
};

export const auth = {
  get currentUser() {
    return authInstance ? authInstance.currentUser : null;
  },
} as any;

// Desired Google Drive Scopes (Gunakan drive.file untuk izin aman & mencegah unverified app warning)
export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
GOOGLE_DRIVE_SCOPES.forEach(scope => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline',
});

const GDRIVE_TOKEN_KEY = 'gasemraya_gdrive_token';

// In-memory & Tab-lifecycle sessionStorage token cache
let isSigningIn = false;
let cachedAccessToken: string | null =
  typeof window !== 'undefined' ? sessionStorage.getItem(GDRIVE_TOKEN_KEY) : null;
let currentUserProfile: User | null = null;

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if ((window as any).google?.accounts?.oauth2) return resolve();
    const existing = document.getElementById('google-gsi-client');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Gagal memuat Google Sign-In SDK')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Gagal memuat Google Sign-In SDK'));
    document.head.appendChild(script);
  });
}

export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!cachedAccessToken && typeof window !== 'undefined') {
    cachedAccessToken = sessionStorage.getItem(GDRIVE_TOKEN_KEY);
  }
  if (!currentUserProfile && typeof window !== 'undefined') {
    const saved = sessionStorage.getItem('gasemraya_gdrive_user');
    if (saved) {
      try {
        currentUserProfile = JSON.parse(saved);
      } catch (e) {}
    }
  }

  if (cachedAccessToken && currentUserProfile) {
    if (onAuthSuccess) onAuthSuccess(currentUserProfile, cachedAccessToken);
    return () => {};
  }

  try {
    const firebaseAuth = getFirebaseAuth();
    return onAuthStateChanged(firebaseAuth, async (user: User | null) => {
      currentUserProfile = user;
      if (user) {
        if (!cachedAccessToken && typeof window !== 'undefined') {
          cachedAccessToken = sessionStorage.getItem(GDRIVE_TOKEN_KEY);
        }
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else if (!isSigningIn) {
          if (onAuthFailure) onAuthFailure();
        }
      } else {
        cachedAccessToken = null;
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem(GDRIVE_TOKEN_KEY);
          sessionStorage.removeItem('gasemraya_gdrive_user');
        }
        if (onAuthFailure) onAuthFailure();
      }
    });
  } catch {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
};

export const googleSignIn = async (): Promise<{ user: any; accessToken: string }> => {
  const customClientId =
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.GOOGLE_CLIENT_ID?.trim() || import.meta.env?.VITE_GOOGLE_CLIENT_ID?.trim())) ||
    DEFAULT_FIREBASE_CONFIG.oAuthClientId;

  // 1. Prioritaskan Google Identity Services (GIS) Token Client untuk custom Client ID
  if (customClientId && !customClientId.startsWith('your-')) {
    if (!(window as any).google?.accounts?.oauth2) {
      await loadGsiScript();
    }

    if ((window as any).google?.accounts?.oauth2) {
      return await new Promise((resolve, reject) => {
        try {
          const client = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: customClientId,
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) {
                console.error('Google OAuth Error Response:', tokenResponse);
                let msg = tokenResponse.error_description || tokenResponse.error;
                if (tokenResponse.error === 'access_denied') {
                  msg =
                    'Akses diblokir (Error 403): Email akun Google Anda belum dimasukkan ke daftar "Test Users" pada Google Cloud Console -> OAuth consent screen.';
                } else if (tokenResponse.error === 'popup_blocked_by_browser') {
                  msg =
                    'Popup Google diblokir oleh peramban. Silakan klik ikon tanda blokir di kanan bilah alamat URL dan pilih "Selalu izinkan pop-up".';
                }
                reject(new Error(msg));
                return;
              }
              const accessToken = tokenResponse.access_token;
              cachedAccessToken = accessToken;
              sessionStorage.setItem(GDRIVE_TOKEN_KEY, accessToken);

              try {
                // Ambil info profil menggunakan Google Drive About API (selaras dengan scope drive.file)
                const aboutRes = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
                  headers: { Authorization: `Bearer ${accessToken}` },
                });
                const aboutData = await aboutRes.json();
                const u = aboutData.user;
                const userObj: any = {
                  displayName: u?.displayName || 'Pengguna Google Drive',
                  email: u?.emailAddress || '',
                  photoURL: u?.photoLink || '',
                  uid: u?.permissionId || 'gdrive-user',
                };
                currentUserProfile = userObj;
                sessionStorage.setItem('gasemraya_gdrive_user', JSON.stringify(userObj));
                resolve({ user: userObj, accessToken });
              } catch {
                const fallbackUser: any = {
                  displayName: 'Pengguna Google Drive',
                  email: '',
                  photoURL: '',
                  uid: 'gdrive-user',
                };
                currentUserProfile = fallbackUser;
                resolve({ user: fallbackUser, accessToken });
              }
            },
            error_callback: (err: any) => {
              let msg = err?.message || 'Otorisasi Google Drive dibatalkan atau popup diblokir.';
              if (err?.type === 'popup_closed') {
                msg = 'Jendela login Google ditutup sebelum persetujuan selesai.';
              } else if (err?.type === 'popup_failed_to_open') {
                msg =
                  'Peramban memblokir popup login. Harap izinkan pop-up pada bilah alamat browser Anda lalu coba kembali.';
              }
              reject(new Error(msg));
            },
          });
          client.requestAccessToken({ prompt: 'consent' });
        } catch (err: any) {
          reject(new Error(err?.message || 'Gagal memulai otorisasi Google Identity Services.'));
        }
      });
    } else {
      throw new Error('Google Sign-In SDK sedang diinisialisasi. Silakan klik tombol "Sign in with Google" sekali lagi.');
    }
  }

  // 2. Fallback ke Firebase Auth HANYA jika tidak ada custom Client ID
  try {
    isSigningIn = true;
    const firebaseAuth = getFirebaseAuth();
    const result = await signInWithPopup(firebaseAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google Drive. Pastikan Anda memberikan izin akses.');
    }

    cachedAccessToken = credential.accessToken;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(GDRIVE_TOKEN_KEY, credential.accessToken);
    }
    currentUserProfile = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error?.code === 'auth/popup-blocked') {
      throw new Error(
        'Popup login Google diblokir oleh browser. Harap izinkan pop-up (Always allow pop-ups) pada bilah URL browser Anda.'
      );
    }
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!cachedAccessToken && typeof window !== 'undefined') {
    cachedAccessToken = sessionStorage.getItem(GDRIVE_TOKEN_KEY);
  }
  return cachedAccessToken;
};

export const getCurrentGoogleUser = (): any | null => {
  return currentUserProfile || (authInstance ? authInstance.currentUser : null);
};

export const logoutGoogle = async () => {
  if (authInstance) {
    try {
      await signOut(authInstance);
    } catch {}
  }
  if (cachedAccessToken && (window as any).google?.accounts?.oauth2?.revoke) {
    try {
      (window as any).google.accounts.oauth2.revoke(cachedAccessToken, () => {});
    } catch {}
  }
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(GDRIVE_TOKEN_KEY);
    sessionStorage.removeItem('gasemraya_gdrive_user');
  }
  currentUserProfile = null;
};

