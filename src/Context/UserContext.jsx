import React, { createContext, useContext, useEffect, useState } from "react";
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
          name: decrypt(data.name),
          email: decrypt(data.email),
          gender: decrypt(data.gender),
          numberTelf: decrypt(data.numberTelf),
          province: decrypt(data.province),
          imageProfile: decrypt(data.imageProfile),
          uid:data.uid,
          isOnline:data.isOnline,
          posts:data.posts
        };
      });
      setUsers(userData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ users }}>
      {children}
    </UserContext.Provider>
  );
};
export const useUserContext = () => {
    return useContext(UserContext);
};
