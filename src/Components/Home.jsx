import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../Context/UserContext.jsx"; 
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
    if (userId) {
      navigate(`/Home/${userId}`, { replace: true });
    }
  }, [navigate, userId]);

  const currentUser = useMemo(() => {
    return users.length > 0 ? users.find((user) => user.uid === userId) : null;
  }, [userId]);

  const publications = useMemo(() => {
    if (!users.length) return [];
    return users.flatMap((user) =>
      (user.posts || []).map((post) => ({
        owner: user.name,
        name_gym: user.name_gym || '',
        rol : user.rol,
        ownerPhoto: user.imageProfile, 
        ownerId: user.uid, 
        post: post || []
      }))
    );
  }, [users]);  

  const shuffledPublications = shuffled(publications);

  return (
    <main id="main-home">
      <Post currentUser={currentUser} />
      <Publications users={shuffledPublications} currentUser={currentUser} />
      <NavBarHome userId={userId} />
    </main>
  );
});

export default Home;
