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
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
    firebaseConfig.oAuthClientId;

  // 1. Prioritaskan Google Identity Services (GIS) Token Client untuk custom Client ID
  if (customClientId) {
    try {
      await loadGsiScript();
      if ((window as any).google?.accounts?.oauth2) {
        return await new Promise((resolve, reject) => {
          const client = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: customClientId,
            scope:
              'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) {
                reject(new Error(tokenResponse.error_description || tokenResponse.error));
                return;
              }
              const accessToken = tokenResponse.access_token;
              cachedAccessToken = accessToken;
              sessionStorage.setItem(GDRIVE_TOKEN_KEY, accessToken);

              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${accessToken}` },
                });
                const userData = await userRes.json();
                const userObj: any = {
                  displayName: userData.name || userData.email || 'Pengguna Google',
                  email: userData.email || '',
                  photoURL: userData.picture || '',
                  uid: userData.sub || '',
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
              reject(new Error(err?.message || 'Otorisasi Google Drive dibatalkan'));
            },
          });
          client.requestAccessToken({ prompt: 'consent' });
        });
      }
    } catch (gisErr) {
      console.warn('GIS Token Client tidak tersedia, beralih ke Firebase:', gisErr);
    }
  }

  // 2. Fallback ke Firebase Auth
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

