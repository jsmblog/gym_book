import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../ConfigFirebase/config.js"; 
import decrypt from "../Js/decrypt.js"; 

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const usersCollection = collection(db, "USERS");

  useEffect(() => {
    const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
      const userData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          name: decrypt(data.n),
          email: decrypt(data.e),
          gender: decrypt(data.g),
          numberTelf: decrypt(data.tel),
          province: decrypt(data.pro),
          imageProfile: decrypt(data.img),
          uid: data.uid,
          isOnline: data.on,
          posts: data.posts || [], 
        };
      });
      setUsers(userData);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({ users }), [users]); 

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};
