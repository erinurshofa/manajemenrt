import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Dukung custom Google OAuth Client ID dan API Key dari .env jika pengguna memasukkannya
const customApiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_API_KEY) || firebaseConfig.apiKey;
const customClientId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) || firebaseConfig.oAuthClientId;

const effectiveConfig = {
  ...firebaseConfig,
  apiKey: customApiKey,
  oAuthClientId: customClientId,
};

// Ensure Firebase is initialized only once
const app = getApps().length === 0 ? initializeApp(effectiveConfig) : getApp();
export const auth = getAuth(app);

// Desired Google Drive Scopes (Gunakan drive.file untuk izin aman & mencegah unverified app warning)
export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
];

const provider = new GoogleAuthProvider();
GOOGLE_DRIVE_SCOPES.forEach(scope => {
  provider.addScope(scope);
});
// Set prompt to select account / consent
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

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    currentUserProfile = user;
    if (user) {
      if (!cachedAccessToken && typeof window !== 'undefined') {
        cachedAccessToken = sessionStorage.getItem(GDRIVE_TOKEN_KEY);
      }
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token belum ada di sesi tab, panggil failure agar komponen menampilkan tombol Masuk
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(GDRIVE_TOKEN_KEY);
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
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

export const getCurrentGoogleUser = (): User | null => {
  return currentUserProfile || auth.currentUser;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(GDRIVE_TOKEN_KEY);
  }
  currentUserProfile = null;
};

