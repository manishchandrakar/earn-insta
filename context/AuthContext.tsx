import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface IUserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  reelsCount: number;
  createdAt: any;
}

export interface IAuthContext {
  user: User | null;
  userProfile: IUserProfile | null;
  loading: boolean;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  getToken: () => Promise<string | null>;
  deleteAccount: (password: string) => Promise<void>;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const saveToken = useCallback((token: string) => {
    setAccessToken(token);
  }, []);

  const clearToken = useCallback(() => {
    setAccessToken(null);
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const token = await user.getIdToken(false);
    setAccessToken(token);
    return token;
  }, [user]);

  const startTokenRefresh = useCallback((firebaseUser: User) => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(async () => {
      const token = await firebaseUser.getIdToken(true);
      setAccessToken(token);
    }, 55 * 60 * 1000);
  }, []);

  const fetchUserProfile = useCallback(async (uid: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) setUserProfile(docSnap.data() as IUserProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        saveToken(token);
        startTokenRefresh(firebaseUser);
        await fetchUserProfile(firebaseUser.uid);
      } else {
        clearToken();
        if (refreshTimer.current) clearInterval(refreshTimer.current);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [clearToken, fetchUserProfile, saveToken, startTokenRefresh]);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signup = useCallback(async (email: string, username: string, password: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser, { displayName: username });

    const profile: IUserProfile = {
      uid: newUser.uid,
      email,
      username: username.toLowerCase(),
      displayName: username,
      photoURL: '',
      bio: '',
      followersCount: 0,
      followingCount: 0,
      reelsCount: 0,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', newUser.uid), profile);
    setUserProfile(profile);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    clearToken();
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    setUserProfile(null);
  }, [clearToken]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchUserProfile(user.uid);
  }, [user, fetchUserProfile]);

  const deleteAccount = useCallback(async (password: string) => {
    if (!user?.email) throw new Error('No user logged in.');

    // Re-authenticate first (Firebase requires recent login for deletion)
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    const uid = user.uid;

    // Delete all user's reels from Firestore
    const reelsSnap = await getDocs(query(collection(db, 'reels'), where('userId', '==', uid)));
    await Promise.all(reelsSnap.docs.map((d) => deleteDoc(d.ref)));

    // Delete user profile document
    await deleteDoc(doc(db, 'users', uid));

    // Delete Firebase Auth account
    await deleteUser(user);

    clearToken();
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    setUserProfile(null);
  }, [user, clearToken]);

  const value = useMemo(
    () => ({ user, userProfile, loading, accessToken, login, signup, logout, refreshProfile, getToken, deleteAccount }),
    [user, userProfile, loading, accessToken, login, signup, logout, refreshProfile, getToken, deleteAccount]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
