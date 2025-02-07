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
  // useEffect para obtener los datos del usuario
  useEffect(() => {
    if (!authUser) {
      setCurrentUserData(null);
      setUsers([]);
      setIsLoading(false);
      return;
    }
  
    const usersCollectionRef = collection(db, "USERS");
  
    const unsubscribe = onSnapshot(
      usersCollectionRef,
      (snapshot) => {
        let currentUser = null;
  
        const allUsers = snapshot.docs.map((doc) => {
          const data = doc.data();
  
          const userObj = {
            name: decrypt(data.n),
            email: decrypt(data.e),
            gender: decrypt(data.g) || "",
            numberTelf: decrypt(data.tel),
            province: decrypt(data.pro),
            imageProfile: decrypt(data.img),
            uid: data.uid,
            rol: data.rol,
            instr: data.f_d && typeof data.f_d === "object" ? data.f_d : {},
            address: data.dir && decrypt(data.dir),
            name_gym: data.n_g && decrypt(data.n_g),
            isOnline: data.on,
            posts: data.posts || [],
            gymData:
              data.gymData && typeof data.gymData === "object"
                ? data.gymData
                : {},
          };
  
          if (data.uid === authUser.uid) {
            currentUser = {
              ...userObj,
              v: data.v,
            };
          }
  
          return userObj;
        });
  
        setUsers(allUsers);
        setCurrentUserData(currentUser);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setUsers([]);
        setCurrentUserData(null);
        setIsLoading(false);
      }
    );
  
    return unsubscribe;
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
