// AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { AUTH_USER, db } from "../ConfigFirebase/config.js";
import decrypt from "../Js/decrypt.js";

const UserContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(AUTH_USER, (user) => {
      setAuthUser(user);
      if (!user) {
        setCurrentUserData(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch datos del usuario actual usando onSnapshot
  useEffect(() => {
    if (!authUser) {
      setCurrentUserData(null);
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, "USERS", authUser.uid);
    
    const unsubscribeCurrentUser = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentUserData({
            name: decrypt(data.n),
            email: decrypt(data.e),
            gender: decrypt(data.g) || "",
            numberTelf: decrypt(data.tel),
            province: decrypt(data.pro),
            imageProfile: decrypt(data.img),
            uid: data.uid,
            rol: data.rol,
            name_gym: data.n_g && decrypt(data.n_g),
            isOnline: data.on,
            posts: data.posts || [],
            v: data.v, // Verificación (campo "v")
          });
        } else {
          console.error("No se encontró el documento del usuario actual.");
          setCurrentUserData(null);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error al obtener datos del usuario actual:", error);
        setCurrentUserData(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribeCurrentUser();
  }, [authUser]);

  // Opcional: suscripción a todos los usuarios
  useEffect(() => {
    if (!authUser) {
      setUsers([]);
      return;
    }
    
    const usersCollection = collection(db, "USERS");
    const unsubscribeUsers = onSnapshot(
      usersCollection,
      (snapshot) => {
        const allUsers = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            name: decrypt(data.n),
            email: decrypt(data.e),
            gender: decrypt(data.g) || "",
            numberTelf: decrypt(data.tel),
            province: decrypt(data.pro),
            imageProfile: decrypt(data.img),
            uid: data.uid,
            rol: data.rol,
            name_gym: data.n_g && decrypt(data.n_g),
            isOnline: data.on,
            posts: data.posts || [],
          };
        });
        setUsers(allUsers);
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );

    // Cleanup: Detener la escucha de todos los usuarios si authUser cambia
    return () => unsubscribeUsers();
  }, [authUser]);

  const value = useMemo(
    () => ({
      authUser,
      currentUserData,
      users,
      isLoading,
    }),
    [authUser, currentUserData, users, isLoading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
