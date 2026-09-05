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

// Lazy Firebase Auth initialization
let authInstance: ReturnType<typeof getAuth> | null = null;

export const getFirebaseAuth = () => {
  if (!authInstance) {
    const customApiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_API_KEY) || firebaseConfig.apiKey;
    const customClientId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) || firebaseConfig.oAuthClientId;

    const effectiveConfig = {
      ...firebaseConfig,
      apiKey: customApiKey,
      oAuthClientId: customClientId,
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

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
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
  return currentUserProfile || (authInstance ? authInstance.currentUser : null);
};

export const logoutGoogle = async () => {
  if (authInstance) {
    await signOut(authInstance);
  }
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(GDRIVE_TOKEN_KEY);
  }
  currentUserProfile = null;
};

