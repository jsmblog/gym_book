import React, { useMemo } from "react";
import { useUserContext } from "../Context/UserContext.jsx"; 
import SesionOff from "./SesionOff";
import NavBarHome from "./NavBarHome";
import "../Styles/stylesHome.css";
import Post from "./Post.jsx";
import Publications from "./Publications.jsx";
import shuffled from './../Js/shuffled';

const Home = React.memo(({ userId }) => {
  const { users } = useUserContext(); 

  const currentUser = useMemo(() => {
    return users.find((user) => user.uid === userId) || null;
  }, [userId, users]);

  const publications = useMemo(() => {
    return users.flatMap((user) =>
      (user.posts || []).map((post) => ({
        owner: user.name,
        name_gym: user.name_gym || '',
        rol: user.rol,
        ownerPhoto: user.imageProfile, 
        ownerId: user.uid, 
        post: post || []
      }))
    );
  }, [users]);

  const shuffledPublications = shuffled(publications);

  if (!currentUser) {
    return (
      <div className="loading-container">
        <p>Descargando datos de usuario...</p>
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <main id="main-home">
      <Post currentUser={currentUser} />
      <Publications users={shuffledPublications} currentUser={currentUser} />
      <NavBarHome userId={userId} />
    </main>
  );
});

export default Home;
