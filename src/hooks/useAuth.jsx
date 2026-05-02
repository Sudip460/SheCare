import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        setUserProfile(snapshot.exists() ? snapshot.data().profile || null : null);
        setLoading(false);
      },
      () => {
        setUserProfile(null);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      async login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
      },
      async register(email, password, profile = {}) {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(
          doc(db, "users", credential.user.uid),
          {
            profile: {
              email,
              role: "patient",
              displayName: profile.displayName || email.split("@")[0],
              wantsDoctorConsultancy: Boolean(profile.wantsDoctorConsultancy),
              doctorStatus: profile.doctorStatus || "none",
              doctorId: profile.doctorId || null,
              doctorName: profile.doctorName || null,
            },
            createdAt: serverTimestamp(),
          },
          { merge: true }
        );
        return credential;
      },
      async getUserProfile(uid) {
        const snapshot = await getDoc(doc(db, "users", uid));
        return snapshot.exists() ? snapshot.data().profile || null : null;
      },
      logout() {
        return signOut(auth);
      },
    }),
    [user, userProfile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
