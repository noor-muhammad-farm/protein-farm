import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { isAuthorizedAdminEmail } from '../config/admin';
import { AppUser, UserRole } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: AppUser | null;
  isAdmin: boolean;
  isCustomer: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize auth state with Firestore user document
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userRef);

          const emailIsAdmin = isAuthorizedAdminEmail(fbUser.email);

          if (userSnap.exists()) {
            const data = userSnap.data() as AppUser;
            // If email is in admin list but role wasn't admin, upgrade it
            const role: UserRole = emailIsAdmin ? 'admin' : (data.role || 'customer');
            
            if (data.role !== role) {
              await setDoc(userRef, { role, updatedAt: new Date().toISOString() }, { merge: true });
            }

            setCurrentUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || data.displayName || 'User',
              role,
              createdAt: data.createdAt,
            });
          } else {
            // New user registration profile
            const role: UserRole = emailIsAdmin ? 'admin' : 'customer';
            const newUser: AppUser = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Farm Visitor',
              role,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userRef, newUser);
            setCurrentUser(newUser);
          }
        } catch (err) {
          console.error('Error synchronizing user doc:', err);
          // Fallback user state based on email admin list
          const role: UserRole = isAuthorizedAdminEmail(fbUser.email) ? 'admin' : 'customer';
          setCurrentUser({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'User',
            role,
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
      const role: UserRole = isAuthorizedAdminEmail(email) ? 'admin' : 'customer';
      const userDoc: AppUser = {
        uid: cred.user.uid,
        email,
        displayName: name,
        role,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), userDoc);
      setCurrentUser(userDoc);
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isCustomer = currentUser?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        isAdmin,
        isCustomer,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
