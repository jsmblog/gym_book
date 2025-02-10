import React, { useState } from "react";
import "../Styles/stylesPublications.css";
import decrypt from "../Js/decrypt";
import sliceText from "../Js/sliceText";
import formatDate from "./../Js/formatDate";
import iconHeart from "/heart.webp";
import iconHeartRed from "/amor.webp";
import iconShare from "/share.webp";
import iconComment from "/comment.webp";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../ConfigFirebase/config";
import useMessage from "../Hooks/useMessage";
import DisplayMessage from "./DisplayMessage";
import uuid from './../Js/uuid';
import encrypt from "../Js/encrypt";
import CommentsBox from "./CommentsBox";
import { useNavigate } from "react-router-dom";
const COUNT = 10
const Publications = React.memo(({ users, currentUser, allUsers }) => {
  const [visibleCount, setVisibleCount] = useState(COUNT);
  const navigate = useNavigate();
  const [isOnBoxComments, setIsOnBoxComments] = useState(false)
  const [message, messageError] = useMessage();
  const [currentComments, setCurrentComments] = useState([]);
  const [ownerId, setOwnerId] = useState('');
  const showMorePublications = () => {
    const nextCount = visibleCount + COUNT;

    if (nextCount <= users.length) {
      setVisibleCount(nextCount);
    } else {
      setVisibleCount(users.length);
    }
  };

  const visiblePublications = users.slice(0, visibleCount);

  const handleLiked = async (post, userId) => {
    try {
      const docRef = doc(db, "USERS", userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error("User document not found!");
        return;
      }

      const userData = docSnap.data();
      const posts = userData.posts || [];

      const userLiked = {
        id: userId, // id
        n: currentUser.name, // name
        p: currentUser.imageProfile // photo
      };

      // Buscar el post a actualizar
      const updatedPosts = posts.map((p) => {
        if (p.post_id === post.post_id) {
          const hasLiked = p.likes?.some((like) => like.id === userId);

          if (hasLiked) {
            messageError("¡Ya diste like a esta publicación!");
            return p; // No modificar el post si ya tiene el like
          }

          const updatedLikes = p.likes ? [...p.likes, userLiked] : [userLiked];
          messageError("Me gusta enviado con éxito");
          return { ...p, likes: updatedLikes };
        }
        return p;
      });

      await updateDoc(docRef, { posts: updatedPosts });

    } catch (error) {
      console.error("Error liking the post:", error.message);
    }
  };

  const handleShared = async (post, userId) => {
    try {
      if (currentUser?.uid === userId) {
        messageError("No puedes compartir tu propia publicación");
        return;
      }
      const docRefCurrentUser = doc(db, "USERS", currentUser?.uid);
      const docRefOwner = doc(db, "USERS", userId);

      const [docSnapOwner, docSnapCurrentUser] = await Promise.all([
        getDoc(docRefOwner),
        getDoc(docRefCurrentUser)
      ]);

      if (!docSnapOwner.exists()) {
        console.error("Owner document not found!");
        return;
      }
      if (!docSnapCurrentUser.exists()) {
        console.error("Current user document not found!");
        return;
      }

      const ownerData = docSnapOwner.data();
      const currentUserData = docSnapCurrentUser.data();

      const hasShared = currentUserData.posts.some((p) => p.post_id === post.post_id && p.i_sh);

      if (hasShared) {
        messageError("¡Ya compartiste esta publicación!");
        return;
      }
      const createdAt = new Date().toISOString();
      const sharedPost = {
        c_a: createdAt,
        d: post.d || '',
        s: '',
        m: post.m || [],
        l: post.l || '',
        post_id: uuid(35),
        i_sh: true,
        likes: [],
        comments: [],
        shared: []
      };

      const updatedCurrentUserPosts = [...currentUserData.posts, sharedPost];

      await updateDoc(docRefCurrentUser, { posts: updatedCurrentUserPosts });

      const user = {
        id: currentUser.uid,
        n: encrypt(currentUser.name),
        p: encrypt(currentUser.imageProfile)
      }

      const updatedOwnerPosts = ownerData.posts.map((p) => {
        if (p.post_id === post.post_id) {
          const updatedShared = p.shared ? [...p.shared, user] : [user];
          return { ...p, shared: updatedShared };
        }
        return p;
      });

      await updateDoc(docRefOwner, { posts: updatedOwnerPosts });

      messageError("¡Publicación compartida con éxito!");

    } catch (error) {
      console.error("Error sharing the post:", error.message);
    }
  };

  const handleComments = async (comments, uidOwner) => {
    setIsOnBoxComments(!isOnBoxComments)
    setCurrentComments(comments);
    setOwnerId(uidOwner)
  }

  const navigateToPerfilUserSelected = (user) => {
    try {
      if (!user) {
        messageError('Error');
        return;
      }
      const userSelected = allUsers.find(u => u.uid === user.ownerId);
      navigate(`/perfil/${user.ownerId}`, { state: userSelected || null })
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <>
      <section id="sect-publications">
        <div className="container-publications">
          {visiblePublications?.map((user) => (
            <div key={user.post.post_id} style={{ border: user.rol === 'owner' ? '1px solid #818080' : '' }} className="publication">
              <div className="publication-header">
                <div>
                  <img onClick={() => navigateToPerfilUserSelected(user)} src={user.ownerPhoto} alt="" />
                  <p className="name-navigate" onClick={() => navigateToPerfilUserSelected(user)}><h4 id="name_gym">{user.name_gym || ''}</h4> {user.rol === 'instructor' ? 'Instr :' : ''} {user.owner}</p>
                  {user.post?.s && (
                    <span id="sentiment-user">{`se siente ${decrypt(user.post?.s)}`}</span>
                  )}
                </div>
                <span>{formatDate(user.post?.c_a)}</span>
              </div>
              <p className="libre-Baskerville paragrahp">{decrypt(user.post?.d) || ""}</p>
              {user.post?.m?.length > 0 && 
                <div className="publication-media">
                {user.post?.m?.map((media, index) => (
                  media.t === "image" ? (
                    <img className="width-media" key={index} src={media.f} alt="Imagen de la publicación" />
                  ) : (
                    <video className="width-media" key={index} muted controls>
                      <source src={media.f} type="video/mp4" />
                      Tu navegador no soporta la reproducción de videos.
                    </video>
                  )
                ))}
              </div>
              }
              <a
                id="link-user"
                href={decrypt(user.post?.l)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {sliceText(decrypt(user.post?.l), 25)}
              </a>
              {user.post.i_sh && <h6 id="isShared">publicación compartida</h6>}
              <div className="reactions">
                <button onClick={() => handleLiked(user.post, user.ownerId)}>
                  <img src={user.post?.likes?.some(like => like.id === user.ownerId) ? iconHeartRed : iconHeart} alt="like" />
                  <span>{user.post?.likes?.length}</span>
                </button>
                <button onClick={() => handleComments(user.post, user.ownerId)} >
                  <img src={iconComment} alt="comment" />
                  <span>{user.post?.comments?.length}</span>
                </button>
                <button onClick={() => handleShared(user.post, user.ownerId)}>
                  <img src={iconShare} alt="share" />
                  <span>{user.post?.shared?.length}</span>
                </button>
              </div>
            </div>
          ))}

        </div>
        <div id="btn-filter">
          {visiblePublications.length === 0 && (
            <p className="no-publications-message">
              No hay publicaciones disponibles.
            </p>
          )}
          {visibleCount < users.length && (
            <button onClick={showMorePublications} className="btn-show-more fade-in">
              Filtrar más publicaciones ⟳
            </button>
          )}
        </div>
      </section>
      {
        isOnBoxComments && (
          <CommentsBox ownerId={ownerId} publication={currentComments} setIsOnBoxComments={setIsOnBoxComments} currentUser={currentUser} />
        )
      }
      <DisplayMessage message={message} />
    </>
  );
});

export default Publications;
