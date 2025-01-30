import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../Context/UserContext.jsx"; // Importa el contexto
import SesionOff from "./SesionOff";
import NavBarHome from "./NavBarHome";
import "../Styles/stylesHome.css";
import Post from "./Post.jsx";
import Publications from "./Publications.jsx";
import shuffled from './../Js/shuffled';

const Home = React.memo(({ userId }) => {
  const navigate = useNavigate();
  const { users } = useUserContext(); 
  useEffect(() => {
    navigate(`/Home/${userId}`, { replace: true });
  }, [navigate, userId]);

  const currentUser = users.find((user) => user.uid === userId);
  
  const publications = useMemo(() => {
    return users.flatMap((user) => 
      user.posts.map((post) => ({
        owner: user.name,
        ownerPhoto: user.imageProfile, 
        ownerId: user.uid, 
        post: post || [] 
      }))
    );
  }, [users]);  
  
  
   const shuffledPublications = shuffled(publications)
  console.log(shuffledPublications)
  return (
    <main id="main-home">
      <Post currentUser={currentUser} />
      <Publications users={shuffledPublications} currentUser={currentUser} />
      <NavBarHome userId={userId} />
    </main>
  );
});

export default Home;
