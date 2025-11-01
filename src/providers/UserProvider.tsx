// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, database } from "../auth/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "../types/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Create the Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: User | null) => {
        if (firebaseUser) {
          // User is signed in
          const simplifiedUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          // Set state and save to local storage
          setUser(simplifiedUser);
          localStorage.setItem("user", JSON.stringify(simplifiedUser));
        } else {
          // User is signed out
          setUser(null);
          localStorage.removeItem("user");
        }
        // Finished loading
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (!result.user) return;

      const firebaseUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };

      const userDoc = doc(database, "users", result.user.uid);
      const docSnap = await getDoc(userDoc);

      if (!docSnap.exists()) {
        await setDoc(userDoc, firebaseUser);
      } else {
        console.log("Document exists");
      }
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle clearing the user
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
